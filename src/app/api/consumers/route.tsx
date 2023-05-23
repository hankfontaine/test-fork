import { NextResponse } from 'next/server';
import NewConsumer from '../KafkaJS/consumer';
const consumer = NewConsumer();

export async function POST(req: Request, res: Response) {
  console.log("Hit consumer POST route");
  const data = await req.json();
  console.log(data);
  await consumer.startConsumer(data);
  return NextResponse.json({ message: "Consumer started." });
}

export async function PATCH(req: Request, res: Response) {
  console.log("Hit consumer PATCH route");
  await consumer.stopConsumer()
  return NextResponse.json({ message: "Consumer stopped." });
}