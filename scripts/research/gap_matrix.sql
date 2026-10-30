-- Rider-facing fact coverage per bike-year, from VERIFIED claims (MX project only; read-only).
-- Each flag is "at least one verified fact of that kind". Run, then summarise with scripts/research/gap_matrix.py.
select manufacturer, model, model_year,
 bool_or(statement ~* '(fork|front).*(compression|rebound).*(damping|click)|compression damping' and domain in ('suspension','specification')) fork_damping,
 bool_or(statement ~* '(shock|rear).*(compression|rebound)') shock_damping,
 bool_or(statement ~* '\msag\M|ride height') sag,
 bool_or(statement ~* '(fork|front).*(spring rate|spring \(|springs?:)|front fork spring') fork_spring,
 bool_or(statement ~* '(shock|rear).*(spring rate|spring \(|springs?:)|rear shock spring') shock_spring,
 bool_or(statement ~* 'fork oil|fork.*oil (amount|level|quantity|capacity)') fork_oil,
 bool_or(statement ~* 'tire.*(pressure|kpa|psi)|tyre.*pressure') tire_pressure,
 bool_or(statement ~* '(engine|transmission|gear) oil.*(quantity|capacity|change|l \(|litre|liter)|oil (change )?quantity|capacities / engine oil') oil_capacity,
 bool_or(statement ~* 'valve clearance') valve_clearance,
 count(*) filter (where statement ~* 'N·m|\mNm\M|tightening torque') torques,
 count(*) filter (where domain='maintenance' or statement ~* 'maintenance chart|service schedule') schedule_rows,
 count(*) total
from public.claims where status='VERIFIED' and region='US'
group by 1,2,3 order by 1,2,3;
