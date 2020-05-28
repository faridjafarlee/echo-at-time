const ScheduledMessagesRepository = require('../src/repositories/ScheduledMessages');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Worker {
  async run(onStart) {
    if (onStart) onStart();
    // this.subscribeToMessages();
    this.checkScheduledMessages();
  }

  #stopSignal = false;
  #stopped = false;
  #outputStreams = [process.stdout];

  setOutputStream(...outputStreams) {
    this.#outputStreams = outputStreams;
  }

  /*
  subscribeToMessages() {
    if (this.#stopSignal) {
      this.#stopped = true;
    }

    if (this.#stopped) {
      return;
    }

    ScheduledMessagesRepository.onMessage(message => this.printMessage(message));
  }

  unsubscribeFromMessages() {
    ScheduledMessagesRepository.unsubscribe();
  }
  */

  printMessage(scheduledMessage) {
    if (!scheduledMessage) return;

    this.#outputStreams
      .forEach(stream => {
        stream.write(`${scheduledMessage.time} ${scheduledMessage._id} ${scheduledMessage.message}\n`);
      });
  }

  async checkScheduledMessages() {
    if (this.#stopSignal) {
      this.#stopped = true;
    }

    if (this.#stopped) {
      return;
    }

    try {
      const { stamp, scheduledMessages } = await ScheduledMessagesRepository.pickMessages();
      if (scheduledMessages.length && await ScheduledMessagesRepository.lockMessagesByStamp(stamp) === 1) {
        scheduledMessages.forEach(scheduledMesssage => this.printMessage(scheduledMesssage));
        await ScheduledMessagesRepository.deleteScheduleStamp(stamp);
        await ScheduledMessagesRepository.releaseLockMessagesByStamp(stamp);
      }
    } catch (error) {} finally {
      await wait(100);
      this.checkScheduledMessages();
    }
  }

  async stop() {
    this.#stopSignal = true;
    // this.unsubscribeFromMessages();
    while (!this.#stopped) await wait(100);
  }
}

module.exports = Worker;
