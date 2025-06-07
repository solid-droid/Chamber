export class State{
    _data = undefined;
    constructor(data){
        this._data = data;
    }

    get value(){
        return this._data;
    }

    set value(val){
        this._data = val;
    }
}