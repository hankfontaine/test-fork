import { NextResponse } from 'next/server';

export async function GET() {
   // fetch from jolokia localhost 8787
   const response = await fetch('http://127.0.0.1:8778/jolokia/read/kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec');
   const byteIn = await response.json();
   const bytes : number = byteIn.value.OneMinuteRate;
   const count : number = byteIn.value.Count;
   // send some of the data to frontend
   return NextResponse.json({ OneMinuteBytesInRate: bytes, Count: count});
}