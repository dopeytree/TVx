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
    
    const program: Program = {
      channelId,
      title: prog.title?.['#text'] || prog.title || 'Unknown Program',
      description: prog.desc?.['#text'] || prog.desc || '',
      start: parseXMLTVDate(prog['@_start']),
      end: parseXMLTVDate(prog['@_stop']),
      category: prog.category?.['#text'] || prog.category || undefined,
    };
    
    if (!epgData[channelId]) {
      epgData[channelId] = [];
    }
    epgData[channelId].push(program);
  });
  
  // Sort programs by start time
  Object.keys(epgData).forEach(channelId => {
    epgData[channelId].sort((a, b) => a.start.getTime() - b.start.getTime());
  });
  
  return epgData;
};

const parseXMLTVDate = (dateStr: string): Date => {
  // XMLTV format: YYYYMMDDHHmmss +ZZZZ
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const hour = parseInt(dateStr.substring(8, 10));
  const minute = parseInt(dateStr.substring(10, 12));
  const second = parseInt(dateStr.substring(12, 14));
  
  return new Date(year, month, day, hour, minute, second);
};
