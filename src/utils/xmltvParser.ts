import { XMLParser } from 'fast-xml-parser';
import { Program, EPGData } from "@/types/iptv";

export const parseXMLTV = (content: string): EPGData => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  
  const result = parser.parse(content);
  const epgData: EPGData = {};
  
  if (!result.tv || !result.tv.programme) {
    return epgData;
  }
  
  const programmes = Array.isArray(result.tv.programme) 
    ? result.tv.programme 
    : [result.tv.programme];
  
  programmes.forEach((prog: any) => {
    const channelId = prog['@_channel'];
    if (!channelId) return;
    
    console.log('Processing programme for channel:', channelId, 'title:', prog.title?.['#text'] || prog.title);
    
    const program: Program = {
      channelId,
      title: prog.title?.['#text'] || prog.title || 'Unknown Program',
      description: prog.desc?.['#text'] || prog.desc || '',
      start: parseXMLTVDate(prog['@_start']),
      end: parseXMLTVDate(prog['@_stop']),
      category: prog.category?.['#text'] || prog.category || undefined,
      icon: prog.icon?.['@_src'] || undefined,
      image: prog.image?.['@_src'] || undefined,
    };
    
    if (!epgData[channelId]) {
      epgData[channelId] = [];
    }
    epgData[channelId].push(program);
  });
  
  console.log('Parsed EPG data:', epgData);
  
  // Sort programs by start time
  Object.keys(epgData).forEach(channelId => {
    epgData[channelId].sort((a, b) => a.start.getTime() - b.start.getTime());
  });
  
  return epgData;
};

const parseXMLTVDate = (dateStr: string): Date => {
  // XMLTV format: YYYYMMDDHHmmss +ZZZZ or YYYYMMDDHHmmss ZZZZ
  const datePart = dateStr.substring(0, 14);
  const tzPart = dateStr.substring(15).trim(); // +ZZZZ or -ZZZZ
  
  const year = parseInt(datePart.substring(0, 4));
  const month = parseInt(datePart.substring(4, 6)) - 1;
  const day = parseInt(datePart.substring(6, 8));
  const hour = parseInt(datePart.substring(8, 10));
  const minute = parseInt(datePart.substring(10, 12));
  const second = parseInt(datePart.substring(12, 14));
  
  // Parse timezone offset
  let offsetMinutes = 0;
  if (tzPart) {
    const sign = tzPart[0] === '+' ? 1 : -1;
    const offsetHours = parseInt(tzPart.substring(1, 3));
    const offsetMins = parseInt(tzPart.substring(3, 5));
    offsetMinutes = sign * (offsetHours * 60 + offsetMins);
  }
  
  // Create date in UTC, adjusting for the timezone offset
  const utcHour = hour - Math.floor(offsetMinutes / 60);
  const utcMinute = minute - (offsetMinutes % 60);
  
  return new Date(Date.UTC(year, month, day, utcHour, utcMinute, second));
};
