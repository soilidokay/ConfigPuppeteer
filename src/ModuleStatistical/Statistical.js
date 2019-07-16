const fs = require('fs');
const data = require('../../DataJobs')
/**
* Athor: Unmatched Tai Nguyen - 16 /07 /2019 - 18 :05 :50 
*
*/
class Statistical {
    constructor() {
        this.CalculateFrequency = this._Calculatefrequency.bind(this)
        this.Invoke = this._Invoke.bind(this)
        this.Resuslt = {}

    }


    /**
    * Athor: Unmatched Tai Nguyen - Create : 16 /07 /2019 - 18 :07 :16 
    *
    */
    _Calculatefrequency = (datas) => {
        datas.forEach(item => {
            let { linhvuc } = item;
            linhvuc.sort()
            if (!this.Resuslt[linhvuc.toString()]) this.Resuslt[linhvuc.toString()] = {}
            let Tmp = this.Resuslt[linhvuc.toString()]

            if (!Tmp['max']) Tmp['max'] = {}
            if (!Tmp['min']) Tmp['min'] = {}

            if (item.Luong.LuongToiDa == 0 || item.Luong.LuongToiThieu == 0) {
                let sumSalary = item.Luong.LuongToiDa + item.Luong.LuongToiThieu
                !Tmp['max'][sumSalary] ? Tmp['max'][sumSalary] = 1 : Tmp['max'][sumSalary]++
                !Tmp['min'][sumSalary] ? Tmp['min'][sumSalary] = 1 : Tmp['min'][sumSalary]++
            } else {
                !Tmp['max'][item.Luong.LuongToiDa] ? Tmp['max'][item.Luong.LuongToiDa] = 1 : Tmp['max'][item.Luong.LuongToiDa]++
                !Tmp['min'][item.Luong.LuongToiThieu] ? Tmp['min'][item.Luong.LuongToiThieu] = 1 : Tmp['min'][item.Luong.LuongToiThieu]++
            }

        });
    }

    /**
    * Athor: Unmatched Tai Nguyen - Create : 16 /07 /2019 - 20 :35 :42 
    *
    */
    _Invoke = () => {
        data.forEach(item=>this.CalculateFrequency(item))
      //  this.CalculateFrequency('test', data)
        console.log(this.Resuslt)
        fs.writeFileSync('DataJobs/DataStatistical.json', JSON.stringify(this.Resuslt))
    }
}
module.exports = Statistical