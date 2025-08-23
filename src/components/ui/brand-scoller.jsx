"use client";
 
import { BsGoogle, BsLinkedin, BsTwitter, BsGithub } from "react-icons/bs";
import { SiGmail, SiGooglecalendar, SiGooglesheets, SiNotion, SiAirtable, SiGoogledrive } from "react-icons/si";
 
export const BrandScroller = () => {
  return (
    <>
      <div
        className="group flex overflow-hidden py-2 [--gap:2rem] [gap:var(--gap))] flex-row max-w-full [--duration:40s] [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
       {Array(4)
         .fill(0)
         .map((_, i) => (
           <div
             className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row"
             key={i}>
             <div className="flex items-center w-32 gap-3">
               <SiGmail size={24} />
               <p className="text-lg font-semibold opacity-80">Gmail</p>
             </div>
             <div className="flex items-center w-36 gap-3">
               <SiGooglecalendar size={24} />
               <p className="text-lg font-semibold opacity-80">Calendar</p>
             </div>
             <div className="flex items-center w-32 gap-3">
               <SiGooglesheets size={24} />
               <p className="text-lg font-semibold opacity-80">Sheets</p>
             </div>
             <div className="flex items-center w-32 gap-3">
               <SiNotion size={24} />
               <p className="text-lg font-semibold opacity-80">Notion</p>
             </div>
             <div className="flex items-center w-36 gap-3">
               <SiGoogledrive size={24} />
               <p className="text-lg font-semibold opacity-80">Google Drive</p>
             </div>
             <div className="flex items-center w-32 gap-3">
               <BsGithub size={24} />
               <p className="text-lg font-semibold opacity-80">GitHub</p>
             </div>
             <div className="flex items-center w-32 gap-3">
               <SiAirtable size={24} />
               <p className="text-lg font-semibold opacity-80">Airtable</p>
             </div>
             <div className="flex items-center w-32 gap-3">
               <BsLinkedin size={24} />
               <p className="text-lg font-semibold opacity-80">LinkedIn</p>
             </div>
             <div className="flex items-center w-32 gap-3">
               <BsTwitter size={24} />
               <p className="text-lg font-semibold opacity-80">Twitter</p>
             </div>
           </div>
         ))}
     </div>
    </>
  );
};
 
export const BrandScrollerReverse = () => {
  return (
    <>
      <div
        className="group flex overflow-hidden py-2 [--gap:2rem] [gap:var(--gap))] flex-row max-w-full [--duration:40s] [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
       {Array(4)
         .fill(0)
         .map((_, i) => (
           <div
             className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee-reverse flex-row"
             key={i}>
             <div className="flex items-center w-28 gap-3">
               <BsSpotify size={24} />
               <p className="text-lg font-semibold opacity-80">Spotify</p>
             </div>
             <div className="flex items-center w-28 gap-3">
               <BsYoutube size={24} />
               <p className="text-lg font-semibold opacity-80">YouTube</p>
             </div>
             <div className="flex items-center w-28 gap-3">
               <BsAmazon size={24} />
               <p className="text-lg font-semibold opacity-80">Amazon</p>
             </div>

             <div className="flex items-center w-28 gap-3">
               <BsGoogle size={24} />
               <p className="text-lg font-semibold opacity-80">Google</p>
             </div>
           </div>
         ))}
     </div>
    </>
  );
};