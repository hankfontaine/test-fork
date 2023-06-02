"use client"
import { useState, useEffect } from "react";
import GraphTemplate from "@components/GraphTemplate";
import ProducerTesting from "@components/ProducerTesting";
import Stats from "@components/Stats";

const OverallMetrics = () => {
  const dataPoints: {x: string, y: number}[] = [];
  for (let i = 0; i < 20; i++) {
    dataPoints.push({x: `${i}`, y: 0});
  }
  // const dataPoints: {x: string, y: number, count: number, timestamp: number}[] = [];
  // for (let i = 0; i < 20; i++) {
  //   dataPoints.push({x: `${i}`, y: 0, count: 0, timestamp: Date.now()});
  // }
  
  const [ mtm, setMtm ] = useState(dataPoints);
  const [ producerOMR, setProducerOMR ] = useState(dataPoints);
  const [ fproducerOMR, setfProducerOMR ] = useState(dataPoints);
  const [ consumerOMR, setConsumerOMR ] = useState(dataPoints);
  const [ fconsumerOMR, setfConsumerOMR ] = useState(dataPoints);
  // const [ totalBrokers, setBrokers ] = useState('0');
  const [ totalTopics, setTotalTopics ] = useState(10);
  const [ totalPartitions, setTotalPartitions ] = useState(10);
  const [ offlinePartitions, setOfflinePartitions ] = useState(10);
  const [ totalBrokers, setTotalBrokers ] = useState(10);
  const [ offlineBrokers, setOfflineBrokers ] = useState(10);


  const [ tickCache, setTickCache ] = useState<string[]>(["",""]);

  useEffect(() => {
    let timePrev: number = 0;

    const interval = setInterval(() => {
      // Create POST request body for batch queries to Jolokia endpoint
      const body = JSON.stringify([
        {"mbean": "kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec", "type": "read"}, // Messages in per second
        {"mbean": "kafka.server:type=BrokerTopicMetrics,name=TotalProduceRequestsPerSec", "type": "read"}, // Producer requests per second
        {"mbean": "kafka.server:type=BrokerTopicMetrics,name=FailedProduceRequestsPerSec", "type": "read"}, // Failed producer requests per second
        {"mbean": "kafka.server:type=BrokerTopicMetrics,name=TotalFetchRequestsPerSec", "type": "read"}, // Fetch (i.e. consumer) requests per second
        {"mbean": "kafka.server:type=BrokerTopicMetrics,name=FailedFetchRequestsPerSec", "type": "read"}, // Failed fetch (i.e. consumer) requests per second
        {"mbean": "kafka.controller:type=KafkaController,name=GlobalTopicCount", "type": "read"}, // Total topics
        {"mbean": "kafka.controller:type=KafkaController,name=GlobalPartitionCount", "type": "read"}, // Total partitions
        {"mbean": "kafka.controller:type=KafkaController,name=OfflinePartitionsCount", "type": "read"}, // Offline partitions
        {"mbean": "kafka.controller:type=KafkaController,name=ActiveBrokerCount", "type": "read"}, // Active brokers
        {"mbean": "kafka.controller:type=KafkaController,name=FencedBrokerCount", "type": "read"}, // Fenced (inactive) brokers
      ])
      // Fetch data from Jolokia endpoint
      fetch("http://localhost:8778/jolokia/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body
      })
      .then((data) => data.json())
      .then((parsed) => {
        console.log('parsed',parsed)
        // Destructure the fetched data
        // Messages In
        // const messagesTM = parsed[0].value.Count; // Total messages
        const messagesOMR = parsed[0].value.OneMinuteRate; // Messages one minute rate
        // Producer Requests
        // const producerTR = parsed[1].value.Count; // Total requests
        const producerOMR = parsed[1].value.OneMinuteRate; // Requests one minute rate
        // Failed Producer Requests
        // const fproducerTR = parsed[2].value.Count; // Total failed requests
        const fproducerOMR = parsed[2].value.OneMinuteRate; // Failed requests one minute rate
        // Consumer Requests
        // const consumerTR = parsed[3].value.Count; // Total requests
        const consumerOMR = parsed[3].value.OneMinuteRate; // Request one minute rate
        // Failed Consumer Requests
        // const fconsumerTR = parsed[4].value.Count; // Total failed requests
        const fconsumerOMR = parsed[4].value.OneMinuteRate; // Failed request one minute rate
        // Total topics
        const totalTopics = parsed[5].value.Value;
        // Total partitions
        const totalPartitions = parsed[6].value.Value;
        // Offline partitions
        const offlinePartitions = parsed[7].value.Value;
        // Total brokers
        const totalBrokers = parsed[8].value.Value;
        // Inactive brokers
        const offlineBrokers = parsed[9].value.Value;
        
        // console.log(
        //   // messagesTM,
        //   'a',messagesOMR,
        //   // producerTR,
        //   'b',producerOMR,
        //   // fproducerTR,
        //   'c',fproducerOMR,
        //   // consumerTR,
        //   'd',consumerOMR,
        //   // fconsumerTR,
        //   'e',fconsumerOMR,
        //   'f',totalTopics,
        //   'g',totalPartitions,
        //   'h',offlinePartitions,
        //   'i',totalBrokers,
        //   'j',offlineBrokers
        // );

        // Get current date
        const curDate = new Date();
        // Extract time from Date object
        const hours = curDate.getHours();
        const minutes = curDate.getMinutes();
        const seconds = curDate.getSeconds();
        const milliseconds = curDate.getMilliseconds();
        // Format the hours, minutes, and seconds into two-character strings
        const hoursFormatted = hours > 9 ? `${hours}` : `0${hours}`;
        const minutesFormatted = minutes > 9 ? `${minutes}` : `0${minutes}`;
        const secondsFormatted = seconds > 9 ? `${seconds}` : `0${seconds}`;
        // Create formatted time string from above
        const curTime = `${hoursFormatted}:${minutesFormatted}:${secondsFormatted}:${milliseconds}`;

        // Perform tick tracking for VictoryAxis
        // Check current time 
        const timeNow = Date.now();
        // If it's been 1000ms since assigning a tick to tickCache, the curTime seconds ends in 5 or 0
        if (timeNow - timePrev > 600 && parseInt(curTime.slice(6, 8)) % 5 === 0) {
          // Reset the interval
          timePrev = timeNow;
          ''
          // Update the tickCache by removing the oldest tick and adding a new tick
          setTickCache((prevTickCache) => [prevTickCache[1], curTime]);
        }

        setMtm((prev) => {
          const newMtm = prev.slice();
          newMtm.shift();
          newMtm.push({
            x: curTime,
            y: messagesOMR
          })
          return newMtm;
        })

        setProducerOMR((prev) => {
          const newPOMR = prev.slice();
          newPOMR.shift();
          newPOMR.push({
            x: curTime,
            y: producerOMR
          })
          return newPOMR;
        })

        setfProducerOMR((prev) => {
          const newPOMR = prev.slice();
          newPOMR.shift();
          newPOMR.push({
            x: curTime,
            y: fproducerOMR
          })
          return newPOMR;
        })
        
        setConsumerOMR((prev) => {
          const newCOMR = prev.slice();
          newCOMR.shift();
          newCOMR.push({
            x: curTime,
            y: consumerOMR
          })
          return newCOMR;
        })

        setfConsumerOMR((prev) => {
          const newCOMR = prev.slice();
          newCOMR.shift();
          newCOMR.push({
            x: curTime,
            y: fconsumerOMR
          })
          return newCOMR;
        })
        setTotalTopics(totalTopics)
        setTotalPartitions(totalPartitions)
        setOfflinePartitions(offlinePartitions)
        setTotalBrokers(totalBrokers)
        setOfflineBrokers(offlineBrokers)


      })
      .catch((err) => console.log(err));
    }, 500)
    // Cleanup function
    return () => { clearInterval(interval); }
  }, [])


  return (
    <div className="">
      <p className="text-center text-4xl font-light">Dashboard</p>
      <div>
        <ProducerTesting />
      </div>

      <div className="mt-1 grid grid-cols-3">
        
        <div>  
          <GraphTemplate datapoints={mtm}
          fdatapoints = {[{x:'0', y: 0}]}
          visibleTicks={tickCache}
          title ={`Messages in Per Second`} />
        </div>

        <div>  
          <GraphTemplate datapoints={producerOMR}
          fdatapoints={fproducerOMR}
          visibleTicks={tickCache}
          title ={`Producer Request Rate`}/>
        </div> 

        <div>  
          <GraphTemplate datapoints={consumerOMR}
          fdatapoints={fconsumerOMR}
          visibleTicks={tickCache}
          title ={`Consumer Request Rate`}/>
        </div>        
      </div>

      <div className="grid grid-cols-1">
        <Stats totalTopics = {totalTopics} 
              totalPartitions = {totalPartitions}
              offlinePartitions = {offlinePartitions}
              totalBrokers = {totalBrokers}
              offlineBrokers = {offlineBrokers}/>
      </div>
    </div>
  )
}

export default OverallMetrics;