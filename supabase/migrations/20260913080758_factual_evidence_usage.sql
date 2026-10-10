-- Recognize reviewed factual extracts separately from permission to distribute source publications.
-- All existing scope, source hash, reviewer, conflict and approval gates remain required.
create or replace function public.evidence_approved(e jsonb,scope jsonb) returns boolean language sql immutable security invoker set search_path='' as $$
 select coalesce(
 e->'applicability'=scope and e#>'{review,approved_applicability}'=scope
 and e->>'has_conflict'='false' and e->'conflict_references'='[]'::jsonb
 and e#>>'{source,kind}' in ('document','measurement')
 and e#>>'{source,document_sha256}' ~ '^[a-f0-9]{64}$'
 and e#>>'{review,approved_document_sha256}'=e#>>'{source,document_sha256}'
 and length(trim(e#>>'{source,url}'))>0 and length(trim(e#>>'{source,locator}'))>0
 and length(trim(e#>>'{source,reviewed_content}'))>0
 and (e#>>'{rights,basis}' in ('permission','license','public_domain','internal_measurement')
 or (e#>>'{rights,basis}'='factual_extraction' and e#>>'{rights,usage_scope}'='facts_only_no_source_distribution'
 and e#>>'{applicability,region}'='US' and e#>>'{source,kind}'='document'))
 and e#>>'{rights,commercial_use_approved}'='true' and length(trim(e#>>'{rights,reference}'))>0
 and e#>>'{review,decision}'='approved' and e#>>'{review,content_checked}'='true'
 and e#>>'{review,scope_checked}'='true' and e#>>'{review,conflicts_checked}'='true'
 and length(trim(e#>>'{review,reviewer_id}'))>0 and length(trim(e#>>'{review,reviewed_at}'))>0
 and length(trim(e#>>'{review,approval_reference}'))>0,false);
$$;
revoke all on function public.evidence_approved(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.evidence_approved(jsonb,jsonb) to service_role;
