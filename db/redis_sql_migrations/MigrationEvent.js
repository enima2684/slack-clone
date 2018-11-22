let cron = require('node-cron');
let logger = require('../../config/logger');

/**
 * Class that models a migration event
 */
class MigrationEvent{

  /**
   *
   * @param frequency: cron string to specify the frequency of running the job
   * @param trigger: a callback that returns a boolean
   * @param action: a callback that specifies what to do
   */
  constructor({name, frequency, trigger, action}){
    this.name = name;
    this.frequency = frequency;
    this.trigger = trigger;
    this.action = action;
  }

  schedule(){
    logger.info(`scheduling the job ${this.name} at the frequency ${this.frequency}`);
    cron.schedule(this.frequency, () => {
      logger.info(`running cron job ${this.name}`);
      if(this.trigger()){
        logger.info(`cronjob ${this.name} triggered`)
        this.action()
      }
    })
  }
}

module.exports = MigrationEvent;