#!/bin/bash
: > render.log
r(){ python3 feature_video.py "$@" >> render.log 2>&1; }
r ask cfr/r1ask.mp4 16 24 "Tell it what the bike is doing." "One change to try, for your exact bike."
r voice cfr/r2voice.mp4 14 12 "Talk to BAK." "Ask out loud with your hands on the bike. Part of Pro."
r garage cfr/r3garage.mp4 11 26 "Your bike, every setting." "What's stock and what's changed, in one build sheet."
r parts cfr/r4parts.mp4 10 16.5 "Find the part." "Factory and aftermarket, with part numbers."
r service cfr/r5service.mp4 11 12.5 "Know what's due." "The maker's schedule, counted in your hours."
r raceday cfr/r6raceday.mp4 13 21 "Race day, handled." "Motos, setup and a fuel plan on one screen."
r ride cfr/r7ride.mp4 10.5 27 "Where to ride." "Tracks and riding areas, with trail maps."
r riders cfr/r8riders.mp4 10 16.5 "Riders and ride days." "Builds, setup questions, races and practice days."
echo FIN >> render.log
