class check
{
    constructor(type)
    {
        this.type = type;
        this.startAt = new Date();
        this.check = 0;
        this.lastAt = new Date();
    }
}

module.exports = class Status
{
    constructor()
    {
        this.check = [];
        this.requesting = false;
        this.add('waiting');
    }

    lastCheck()
    {
        return this.check[this.check.length - 1];
    }

    setRequesting(requesting) {
        this.requesting = requesting;
    }

    add(type)
    {
        let lastCheck = this.lastCheck();
        if (!lastCheck || lastCheck.type !== type) {
            lastCheck = new check(type);
            this.check.push(lastCheck);
        }
        lastCheck.check++;
        lastCheck.lastAt = new Date();
        return lastCheck;
    }
}
