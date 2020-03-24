const moment = require('moment');
const sprintf = require('sprintf-js').sprintf;
const say = require('say')

module.exports = class Ui {
    constructor(status, refreshSeconds) {
        this.status = status;
        this.i = 0;
        this.lastCheck;
        this.storeName = 'ChronoDrive';
        this.refreshSeconds = refreshSeconds;
        this.interval;

        moment.locale('fr');
    }

    start() {
        this.stop();
        this.interval = setInterval(this.refresh.bind(this), this.refreshSeconds);
    }

    stop() {
        if (!this.interval) {
            return ;
        }
        clearInterval(this.interval);
        delete this.interval;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }

    setStoreName(name) {
        this.storeName = 'ChronoDrive ' + name;
    }

    refresh() {
        this.i = (this.i + 1) % 4;
        let check = this.status.lastCheck();

        if (check.type === 'waiting') {
            this.waiting();
        } else {
            this.display(check);
        }
        this.lastCheck = check;
    }

    formatTime(date) {
        let e = date || new Date();
        return moment(e).format('LTS');
    }

    relativeTime(date) {
        let e = date || new Date();
        return moment(e).startOf().fromNow();
    }

    typeChange() {
        let from = moment(this.lastCheck.startAt);
        let to = moment(this.lastCheck.lastAt);
        let duration = moment.duration(to.diff(from, 'seconds', true), 'seconds').humanize();
        let msg;

        if (this.lastCheck.type === 'maintenance') {
            msg = sprintf('Votre %s était en Maintenance entre %s et %s (%s)', this.storeName, from.format('LTS'), to.format('LTS'), duration);
        } else if (this.lastCheck.type === 'available') {
            msg = sprintf('Votre %s proposait des créneaux entre %s et %s (%s)', this.storeName, from.format('LTS'), to.format('LTS'), duration);
        } else if (this.lastCheck.type === 'unavailable') {
            msg = sprintf('Votre %s ne proposait pas de créneaux entre %s et %s (%s)', this.storeName, from.format('LTS'), to.format('LTS'), duration);
        } else {
            msg = sprintf('Il y a eu une erreur entre %s et %s (%s)', from.format('LTS'), to.format('LTS'), duration);
        }
        process.stdout.write(msg);
        process.stdout.write("\n");
    }

    display(status) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);

        let from = moment(this.lastCheck.startAt);
        // let duration = from.startOf().fromNow()
        let msgSay;
        let msg;

        if (status.type === 'maintenance') {
            msgSay = sprintf('Votre %s est en Maintenance', this.storeName);
        } else if (status.type === 'available') {
            msgSay = sprintf('Votre %s propose des créneaux', this.storeName);
        } else if (status.type === 'unavailable') {
            msgSay = sprintf('Votre %s ne propose pas de créneaux', this.storeName)
        } else {
            msgSay = 'Il y a une erreur';
        }

        let duration = moment.duration(from.diff(moment(), 'seconds', true), 'seconds').humanize();
        msg = sprintf('%s depuis %s (%s)', msgSay, from.format('LTS'), duration);
        if (this.lastCheck.type !== status.type) {
            if (this.lastCheck.type !== 'waiting') {
                this.typeChange();
            }
            say.speak(msgSay);
        }
        if (this.status.requesting) {
            let animFrames = ['|', '/', '-', '\\'];
            process.stdout.write(animFrames[this.i % animFrames.length] + ' ' + msg);
        } else {
            process.stdout.write(msg);
        }
    }

    waiting() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);

        var dots = new Array(this.i + 1).join(".");
        process.stdout.write("Waiting" + dots);
    }
}