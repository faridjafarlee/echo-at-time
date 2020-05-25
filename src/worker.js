const ScheduledMessagesRepository = require('../src/repositories/ScheduledMessages');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Worker {
  async run(onStart) {
    if (onStart) onStart();
    await this.printScheduledMessages();
  }

  #outputStreams = [process.stdout];

  setOutputStream(...outputStreams) {
    this.#outputStreams = outputStreams;
  }

  async printScheduledMessages() {
    for (;;) {
      const scheduledMesssage = await ScheduledMessagesRepository.pick();
      if (scheduledMesssage) {
        this.#outputStreams
          .forEach(stream => {
            stream.write(`${scheduledMesssage.time} ${scheduledMesssage.message}\n`);
          });
      }
      await wait(1000);
    }
  }
}

module.exports = Worker;
