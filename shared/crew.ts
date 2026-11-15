// Crew finder: who an event is for, and the opt-in "riding here today". 'any' fits everyone, so an event that names no level
// still shows under every filter.
export const SKILL_LEVELS=['any','beginner','intermediate','advanced','expert'] as const;
export const BIKE_SIZES=['any','peewee','mini','full'] as const;
export const DISCIPLINES=['any','mx','offroad'] as const;
export type SkillLevel=(typeof SKILL_LEVELS)[number];export type BikeSize=(typeof BIKE_SIZES)[number];export type Discipline=(typeof DISCIPLINES)[number];
export const SKILL_LABELS:Record<SkillLevel,string>={any:'All levels',beginner:'Beginner',intermediate:'Intermediate',advanced:'Advanced',expert:'Expert / Pro'};
export const BIKE_LABELS:Record<BikeSize,string>={any:'All bikes',peewee:'Pee-wee (50–65)',mini:'Minis (85–150)',full:'Full size'};
export const DISCIPLINE_LABELS:Record<Discipline,string>={any:'MX and off-road',mx:'Motocross',offroad:'Off-road / trail'};
export type CrewFilter={skill:SkillLevel;bike:BikeSize;discipline:Discipline};
export const NO_FILTER:CrewFilter={skill:'any',bike:'any',discipline:'any'};
export const filterCount=(f:CrewFilter)=>(f.skill!=='any'?1:0)+(f.bike!=='any'?1:0)+(f.discipline!=='any'?1:0);
/** The short tags an event card shows: only what the host narrowed. */
export function crewTags(e:{skill_level?:string;bike_size?:string;discipline?:string}):string[]{
 const out:string[]=[];
 if(e.skill_level&&e.skill_level!=='any')out.push(SKILL_LABELS[e.skill_level as SkillLevel]??'');
 if(e.bike_size&&e.bike_size!=='any')out.push(BIKE_LABELS[e.bike_size as BikeSize]??'');
 if(e.discipline&&e.discipline!=='any')out.push(DISCIPLINE_LABELS[e.discipline as Discipline]??'');
 return out.filter(Boolean);
}
/** Does an event fit the filter? An 'any' on either side matches. */
export const fitsFilter=(e:{skill_level?:string;bike_size?:string;discipline?:string},f:CrewFilter)=>
 (f.skill==='any'||!e.skill_level||e.skill_level==='any'||e.skill_level===f.skill)&&(f.bike==='any'||!e.bike_size||e.bike_size==='any'||e.bike_size===f.bike)&&(f.discipline==='any'||!e.discipline||e.discipline==='any'||e.discipline===f.discipline);
export const PRESENCE_COPY={
 title:'Riding here today',show:'Show I’m riding here today',hide:'Stop showing me',
 detail:'Signed-in riders see your profile on this track for today only. Blocked riders never see it.',
 none:'Nobody has said they’re riding here today.',needsProfile:'Set up your rider profile in Community to show you’re here.',
} as const;
