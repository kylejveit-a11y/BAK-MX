// BAK MX icon set: drawn for this app on a 24-unit grid, 1.7 stroke, round ends.
// Each shape is stroked unless `fill` is set. 'a' fills with the BAK accent, 's' with the icon colour, 'b' with the page colour (to hide what is behind).
export type Shape={d?:string;c?:[number,number,number];fill?:'a'|'s'|'b';w?:number;t?:string};
const H='M6.4 18.6 C4.2 17.2 3.4 14.6 3.8 12 C4.4 8 7.8 5.4 12 5.4 C13.4 5.4 14.8 5.7 16 6.2 L21 7.4 L20.2 9.2 L17.8 9.4 C18.8 10.6 19.4 12 19.6 13.6 L20.4 15.4 L17.6 18.8 Z',G='M11.6 10 L17.6 10 L18.4 13.6 L12.6 13.6 Z';
export const iconData:Record<string,Shape[]>={
 // Dirt bike, side on: high fenders, long-travel fork, flat seat.
 moto:[{c:[5.4,16.8,3.5]},{c:[18.6,16.8,3.5]},{c:[5.4,16.8,1],fill:'s'},{c:[18.6,16.8,1],fill:'s'},
  {d:'M1.8 9.4 L7.6 10.6 L12 10.6 L14.8 8.6 L15.8 9.6 L14.4 12.4 L12.8 14.6 L9.6 14.6 L8.2 12 Z'},{d:'M9.6 14.6 L5.4 16.8'},
  {d:'M18.6 16.8 L15 6.6'},{d:'M13.2 6.4 L16.8 5.8'},{d:'M16.2 11.2 L21.6 10.2'}],
 // MX helmet, side on: peak, goggle port, chin bar.
 helmet:[{d:H},{d:G,fill:'a',w:0},{d:'M6.6 14.2 L9.6 14.2'}],
 // Two riders' helmets: the community.
 riders:[{d:H,t:'translate(-1.6 -1.2) scale(0.74)',w:2.3},{d:H,t:'translate(5 5) scale(0.78)',w:2.18,fill:'b'},{d:G,t:'translate(5 5) scale(0.78)',fill:'a',w:0}],
 // Checkered flag: events.
 flag:[{d:'M5 21 L5 3.6'},{d:'M5 4.2 L19.4 4.2 L19.4 13.8 L5 13.8'},
  {d:'M5 4.2 h4.8 v4.8 h-4.8 Z M14.6 4.2 h4.8 v4.8 h-4.8 Z M9.8 9 h4.8 v4.8 h-4.8 Z',fill:'s',w:0}],
 // Rear shock: eyes, shaft, coil spring.
 shock:[{c:[12,3.6,1.6]},{c:[12,20.4,1.6]},{d:'M12 5.2 L12 6.6 M12 17.4 L12 18.8'},{d:'M8.2 6.6 L15.8 6.6 M8.2 17.4 L15.8 17.4'},
  {d:'M8.6 6.6 L15.4 9.3 L8.6 12 L15.4 14.7 L8.6 17.4'}],
 // T-handle and socket: the pit tool.
 thandle:[{d:'M3.4 5.4 L20.6 5.4'},{d:'M12 5.4 L12 15'},{d:'M9.4 15 L14.6 15 L14.6 20.6 L9.4 20.6 Z'},{d:'M9.4 17.8 L14.6 17.8'}],
 // Gauge with needle: something's wrong.
 gauge:[{d:'M4.1 16.8 A8.2 8.2 0 1 1 19.9 16.8'},{d:'M12 15.4 L16.2 9.6'},{c:[12,15.4,1.4],fill:'s'},
  {d:'M6.1 11.3 L7.3 12 M12 7.2 L12 8.6 M17.9 11.3 L16.7 12'},{d:'M8 19.6 L16 19.6'}],
 // Bolt head with torque arrow: specs and torques.
 bolt:[{d:'M12 7.6 L15.8 9.8 L15.8 14.2 L12 16.4 L8.2 14.2 L8.2 9.8 Z'},{c:[12,12,1.6]},
  {d:'M4.4 9.2 A8.2 8.2 0 0 1 17.6 5.6'},{d:'M17.9 2.9 L17.6 5.6 L14.9 5.4'}],
 // Oil drop with level line: service log.
 oil:[{d:'M12 3.4 C12 3.4 6.2 10.2 6.2 14.4 A5.8 5.8 0 0 0 17.8 14.4 C17.8 10.2 12 3.4 12 3.4 Z'},{d:'M8.6 14.6 C10 15.4 14 15.4 15.4 14.6'}],
 // Garage door: home.
 home:[{d:'M3.4 10.6 L12 4 L20.6 10.6 L20.6 20 L3.4 20 Z'},{d:'M7.2 20 L7.2 13.4 L16.8 13.4 L16.8 20'},{d:'M7.2 16.6 L16.8 16.6'}],
 // Speech bubble with raked lines: chat with BAK.
 chat:[{d:'M4.6 4.8 L19.4 4.8 Q20.6 4.8 20.6 6 L20.6 15.2 Q20.6 16.4 19.4 16.4 L10.4 16.4 L6.2 19.8 L6.2 16.4 L4.6 16.4 Q3.4 16.4 3.4 15.2 L3.4 6 Q3.4 4.8 4.6 4.8 Z'},
  {d:'M8.2 9 L16.6 9'},{d:'M8.2 12.2 L13.4 12.2'}],
 // Two bubbles: rider messages.
 messages:[{d:'M3.4 5 L14.6 5 Q15.6 5 15.6 6 L15.6 12.4 Q15.6 13.4 14.6 13.4 L8 13.4 L5 16 L5 13.4 L3.4 13.4 Q2.4 13.4 2.4 12.4 L2.4 6 Q2.4 5 3.4 5 Z'},
  {d:'M18 9 L20.6 9 Q21.6 9 21.6 10 L21.6 16.2 Q21.6 17.2 20.6 17.2 L19.4 17.2 L19.4 19.8 L16.4 17.2 L10.6 17.2 Q9.6 17.2 9.6 16.2 L9.6 15.8'}],
 // Notebook: tuning notes, job notes.
 notes:[{d:'M6 3.6 L18 3.6 L18 20.4 L6 20.4 Z'},{d:'M9 8 L15 8 M9 11.4 L15 11.4 M9 14.8 L12.6 14.8'},{d:'M4.4 6.4 L7.4 6.4 M4.4 10.4 L7.4 10.4 M4.4 14.4 L7.4 14.4'}],
 // Shield with tick: supported bikes.
 verified:[{d:'M12 3.4 L19 6 L19 11.6 C19 15.8 16 19 12 20.6 C8 19 5 15.8 5 11.6 L5 6 Z'},{d:'M8.8 12 L11.2 14.4 L15.4 9.8'}],
 // Pencil on a line: write a post.
 compose:[{d:'M14.8 4.6 L19.4 9.2 L9.6 19 L4.6 19.4 L5 14.4 Z'},{d:'M12.8 6.6 L17.4 11.2'},{d:'M13.6 20 L20 20'}],
 // Export: tray with arrow.
 export:[{d:'M12 3.8 L12 14.2'},{d:'M8 10.2 L12 14.2 L16 10.2'},{d:'M4.4 14.8 L4.4 19.6 L19.6 19.6 L19.6 14.8'}],
 signout:[{d:'M13.6 4.4 L5 4.4 L5 19.6 L13.6 19.6'},{d:'M10 12 L20.4 12'},{d:'M16.6 8.2 L20.4 12 L16.6 15.8'}],
 document:[{d:'M6 3.4 L14.6 3.4 L18.6 7.4 L18.6 20.6 L6 20.6 Z'},{d:'M14.4 3.6 L14.4 7.6 L18.4 7.6'},{d:'M9 12 L15.6 12 M9 15.6 L15.6 15.6'}],
 mail:[{d:'M3.6 6 L20.4 6 L20.4 18.4 L3.6 18.4 Z'},{d:'M3.8 6.4 L12 12.8 L20.2 6.4'}],
 trash:[{d:'M4.6 6.6 L19.4 6.6'},{d:'M9.4 6.4 L9.4 4 L14.6 4 L14.6 6.4'},{d:'M6.6 6.8 L7.6 20 L16.4 20 L17.4 6.8'}],
 // Pulse line: handling problem triage.
 pulse:[{d:'M2.6 12.6 L7 12.6 L9.4 6.4 L13.2 18.4 L15.6 11 L16.8 12.6 L21.4 12.6'}],
 // Interface glyphs.
 chevronRight:[{d:'M9.4 5.6 L15.8 12 L9.4 18.4'}],
 chevronLeft:[{d:'M14.6 5.6 L8.2 12 L14.6 18.4'}],
 chevronDown:[{d:'M5.6 9.4 L12 15.8 L18.4 9.4'}],
 chevronUp:[{d:'M5.6 14.6 L12 8.2 L18.4 14.6'}],
 expand:[{d:'M7.6 9.2 L12 4.8 L16.4 9.2'},{d:'M7.6 14.8 L12 19.2 L16.4 14.8'}],
 plus:[{d:'M12 5 L12 19 M5 12 L19 12'}],
 close:[{d:'M6.2 6.2 L17.8 17.8 M17.8 6.2 L6.2 17.8'}],
 arrowUp:[{d:'M12 19.4 L12 5.2'},{d:'M6.2 11 L12 5.2 L17.8 11'}],
 arrowRight:[{d:'M4.6 12 L18.8 12'},{d:'M13 6.2 L18.8 12 L13 17.8'}],
 search:[{c:[10.6,10.6,6]},{d:'M15.1 15.1 L20 20'}],
 checkbox:[{d:'M4.6 4.6 L19.4 4.6 L19.4 19.4 L4.6 19.4 Z'}],
 checkboxOn:[{d:'M4.6 4.6 L19.4 4.6 L19.4 19.4 L4.6 19.4 Z',fill:'a',w:0},{d:'M7.8 12.2 L10.8 15.2 L16.4 9',w:2.2}],
 check:[{d:'M5 12.6 L9.6 17.2 L19 7.4'}],
 refresh:[{d:'M19.4 11.6 A7.4 7.4 0 1 1 16.6 6.2'},{d:'M17.2 2.8 L17 6.4 L13.4 6.6'}],
 heart:[{d:'M12 19.6 C6.2 15.6 3.4 12.6 3.4 9.2 C3.4 6.6 5.4 4.6 7.8 4.6 C9.6 4.6 11 5.6 12 7.2 C13 5.6 14.4 4.6 16.2 4.6 C18.6 4.6 20.6 6.6 20.6 9.2 C20.6 12.6 17.8 15.6 12 19.6 Z'}],
 heartOn:[{d:'M12 19.6 C6.2 15.6 3.4 12.6 3.4 9.2 C3.4 6.6 5.4 4.6 7.8 4.6 C9.6 4.6 11 5.6 12 7.2 C13 5.6 14.4 4.6 16.2 4.6 C18.6 4.6 20.6 6.6 20.6 9.2 C20.6 12.6 17.8 15.6 12 19.6 Z',fill:'s'}],
 comment:[{d:'M4.4 5.4 L19.6 5.4 L19.6 16 L11 16 L6.6 19.6 L6.6 16 L4.4 16 Z'}],
 mic:[{d:'M9.2 4 L14.8 4 L14.8 12.6 Q14.8 15 12 15 Q9.2 15 9.2 12.6 Z'},{d:'M5.8 11.4 C5.8 15 8.6 17.6 12 17.6 C15.4 17.6 18.2 15 18.2 11.4'},{d:'M12 17.8 L12 20.6'}],
 location:[{d:'M12 21 C12 21 5.4 14.6 5.4 9.8 A6.6 6.6 0 0 1 18.6 9.8 C18.6 14.6 12 21 12 21 Z'},{c:[12,9.8,2.2]}],
 more:[{c:[5.4,12,1.3],fill:'s',w:0},{c:[12,12,1.3],fill:'s',w:0},{c:[18.6,12,1.3],fill:'s',w:0}],
 clock:[{c:[12,12,8.4]},{d:'M12 7 L12 12.4 L15.6 14.4'}],
};
