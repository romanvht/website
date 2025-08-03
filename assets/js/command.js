class Command {
    constructor(name, description, action, usage = '', hidden = false) {
        this.name = name;
        this.description = description;
        this.action = action;
        this.usage = usage;
        this.hidden = hidden;
    }
}