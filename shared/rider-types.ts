/** Shapes returned by the rider-surface API. Shared by the web and native clients. */
export type RiderRef={user_id:string;handle:string;display_name:string;location:string;riding_class:string};
export type Profile=RiderRef&{bio:string;created_at:string;updated_at?:string};
export type PostCategory='build'|'setup_question'|'ride_plan'|'general';
export type Post={id:string;user_id:string;category:PostCategory;body:string;bike_label:string;created_at:string;author:RiderRef;mine:boolean;like_count:number;liked:boolean;comment_count:number};
export type PostComment={id:string;post_id:string;user_id:string;body:string;created_at:string;author:RiderRef;mine:boolean};
export type EventType='ride_day'|'race'|'practice'|'clinic'|'meetup';
export type RideEvent={id:string;user_id:string;title:string;event_type:EventType;starts_at:string;ends_at:string|null;location_name:string;description:string;created_at:string;canceled_at:string|null;host:RiderRef;mine:boolean;going_count:number;interested_count:number;my_rsvp:'going'|'interested'|null};
export type ThreadSummary={rider:RiderRef;last_message:{body:string;created_at:string;mine:boolean};unread:number};
export type ThreadMessage={id:string;body:string;created_at:string;mine:boolean};
export type SetupResult='better'|'worse'|'no_change'|'not_tested';
export type SetupLog={id:string;user_id:string;bike_id:string;recorded_at:string;track:string;conditions:string;engine_hours:number|null;settings:Record<string,string|number|null>;change_made:string;result:SetupResult;notes:string;created_at:string};
export type PartCatalog={id:string;source:string;source_url:string;scope_label:string;complete:boolean;assembly_count:number;part_count:number};
export type PartAssembly={id:string;name:string;diagram_url:string;source_url:string;position:number};
export type Part={id:number;position:number;callout:string;part_number:string|null;description:string;quantity_raw:string;remarks:string};

export const POST_CATEGORY_LABELS:Record<PostCategory,string>={build:'Build',setup_question:'Setup question',ride_plan:'Ride plan',general:'General'};
export const EVENT_TYPE_LABELS:Record<EventType,string>={ride_day:'Ride day',race:'Race',practice:'Practice',clinic:'Clinic',meetup:'Meetup'};
export const SETUP_RESULT_LABELS:Record<SetupResult,string>={better:'Better',worse:'Worse',no_change:'No change',not_tested:'Not tested yet'};
/** The settings a rider records per outing. Free text keeps the rider's own reference (clicks out, turns, psi). */
export const SETUP_FIELDS:{key:string;label:string;group:'Fork'|'Shock'|'Chassis'|'Engine'}[]=[
 {key:'fork_compression',label:'Fork compression',group:'Fork'},
 {key:'fork_rebound',label:'Fork rebound',group:'Fork'},
 {key:'fork_height_mm',label:'Fork height in clamps (mm)',group:'Fork'},
 {key:'fork_air_or_spring',label:'Fork air pressure / spring rate',group:'Fork'},
 {key:'shock_low_speed_compression',label:'Shock low-speed compression',group:'Shock'},
 {key:'shock_high_speed_compression',label:'Shock high-speed compression',group:'Shock'},
 {key:'shock_rebound',label:'Shock rebound',group:'Shock'},
 {key:'rider_sag_mm',label:'Rider sag (mm)',group:'Shock'},
 {key:'static_sag_mm',label:'Static sag (mm)',group:'Shock'},
 {key:'front_tire_pressure',label:'Front tire pressure',group:'Chassis'},
 {key:'rear_tire_pressure',label:'Rear tire pressure',group:'Chassis'},
 {key:'gearing',label:'Gearing (front / rear)',group:'Chassis'},
 {key:'engine_map',label:'Map / jetting',group:'Engine'},
 {key:'fuel',label:'Fuel',group:'Engine'},
];
/** Describe what changed between two entries without judging it. */
export function setupDifferences(previous:SetupLog['settings'],current:SetupLog['settings']):{key:string;label:string;from:string;to:string}[]{
 const show=(v:string|number|null|undefined)=>v===null||v===undefined||v===''?'not recorded':String(v);
 return SETUP_FIELDS.filter(f=>show(previous[f.key])!==show(current[f.key])).map(f=>({key:f.key,label:f.label,from:show(previous[f.key]),to:show(current[f.key])}));
}
export const riderName=(r:Pick<RiderRef,'display_name'|'handle'>)=>r.display_name||'@'+r.handle;
export const COMMUNITY_RULES=['Be the rider you would want pitted next to.','No harassment, hate, threats or sexual content.','Nothing illegal, and no selling stolen parts.','Post what you know; say when you are guessing.','Reports are reviewed. Content that breaks the rules is removed and repeat offenders lose access.'];
