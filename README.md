# ECHO AT TIME

#### INSTALLATION

```
npm i
```

#### RUNNING

###### API 

```
npm run api
```

Check [POSTMAN FILE](echo-at-time.postman_collection.json) for API usage

###### WORKER (CONSOLE PRINTER)
```
npm run worker
```

---

#### IDEA

Idea is to:
 
1. save ScheduledMessage struct under uuid key.

2. add that uuid to sorted set using `zadd scheduledMessages {numericTimestampHere} {uuid}` command.

3. using `zpopmin` to get oldest record and check if time is passed or not.

3.1. if passed to output it

3.2. if not passed to put it back to sorted set

* if `now = true` then record will be the first in sorted set since `numericTimestampHere = 0`

---

### THE TASK

The task is to write a simple application server that prints a message at a given time in the future.


The server has only 1 API:


`echoAtTime` - which receives two parameters, time and message, and writes that message to the server console at the given time.

Since we want the server to be able to withstand restarts it will use Redis to persist the messages and the time they should be sent at.

You should also assume that there might be more than one server running behind a load balancer (load balancing implementation itself does not need to be provided as part of the answer).

In case the server was down when a message should have been printed, it should print it out when going back online.


The application should preferably be written in Node.js.


The focus of the exercise is:

1. the efficient use of Redis and its data types

2. messages should not be lost

3. the same message should be printed only once

4. message order should not be changed

5. should be scalable

6. seeing your code in action (SOLID would be a plus)

7. use only redis.io