/**
* Athor: Unmatched Tai Nguyen - 26 /06 /2019 - 21 :28 :01 
*
*/
class BaseService {
    constructor(browser) {
        this._browser = browser
        this.click = this._click.bind(this)
        this.start = this._start.bind(this)
        this.ClosePageCurrent = this._ClosePage.bind(this)
        this.Loop = this._Loop.bind(this)
        this.StartNewPage = this._NewPage.bind(this)
        this.Init = this._Init.bind(this)
        this.SendInputtag = this._SendInputtag.bind(this)
        this.newEvaluate = this._newEvaluate.bind(this)
        this.GetDataWithStruct = this._GetDataWithStruct.bind(this)
        this.TranSformData = this._TranSformData.bind(this)
        this.LoginBase = this._LoginBase.bind(this)
    }

  /**
    * Athor: Unmatched Tai Nguyen - Create : 26 /06 /2019 - 20 :24 :40 
    *
    */
   _LoginBase = async (Query,Info) => {
    console.log('Start login Browser VietNameWork')
    await this.start(Query.urlLogin, 'Page Login')

    await this.SendInputtag(Query.InputAccout,Info.Acount)
    await this.SendInputtag(Query.InputPass,Info.PassWord)

    await this.click(Query.BtnSumit)

    await this._PageCurrent.screenshot({ path: 'img/loginvietnamwork.png' });

    // await this.ClosePageCurrent()
    console.log('End login Browser VietNameWork')

}
    /**
    * Athor: Unmatched Tai Nguyen - Create : 29 /06 /2019 - 17 :42 :52 
    *
    */
    _TranSformData =async (page, fn, rawArgs) => {
        let keys = Object.keys(rawArgs)
        const args = await Promise.all(keys.map(key => {
            return typeof rawArgs[key] === 'function'
                ? page.evaluateHandle(`(${rawArgs[key].toString()})`)
                : rawArgs[key];
        }));

        let objs = await page.evaluate(fn, ...args).catch((err)=>{
            console.log("Error Query:",err)
        });
        let Datas = {}
        objs.forEach((element,index) => {
            Datas[keys[index]] = element
        });
        return Datas
    }

    /**
    * Athor: Unmatched Tai Nguyen - Create : 29 /06 /2019 - 17 :17 :38 
    *
    */
    _GetDataWithStruct =async (page, ObjectStruct) => {

        let DataObject = await this.TranSformData(page, (...args) => {
            let obj = []
            for (let i = 0; i < args.length; i++) {
                obj.push(args[i]())
            }
            return obj
        }, ObjectStruct)

        return DataObject 
    }
    /**
    * Athor: Unmatched Tai Nguyen - Create : 29 /06 /2019 - 16 :08 :33 
    *Hàm chuyển các tham số là hàm từ node js đên nội hàm của trang web
    */
    _newEvaluate = async (page, fn, ...rawArgs) => {
        const args = await Promise.all(rawArgs.map(arg => {
            return typeof arg === 'function'
                ? page.evaluateHandle(`(${arg.toString()})`)
                : arg;
        }));
        return page.evaluate(fn, ...args);
    }


    /**
    * Athor: Unmatched Tai Nguyen - Create : 27 /06 /2019 - 15 :40 :36 
    *
    */
    _Init = async () => {
        this._PageCurrent = await this._browser.newPage()
    }
    /**
    * Athor: Unmatched Tai Nguyen - Create : 27 /06 /2019 - 14 :40 :34 
    *
    */
    _NewPage = async (url) => {
        const newPage = await this._browser.newPage()
        await newPage.goto(url, { waitUntil: 'networkidle0' })
        nameimg && await newPage.screenshot({ path: `img/${nameimg}.png` });
        return newPage
    }


    /**
    * Athor: Unmatched Tai Nguyen - Create : 29 /06 /2019 - 13 :46 :01 
    *
    */
    _SendInputtag = async (selector, text) => {
        await this._PageCurrent.type(selector, text, { delay: 100 })

    }


    /**
    * Athor: Unmatched Tai Nguyen - Create : 26 /06 /2019 - 22 :32 :57 
    *
    */
    _Loop = async (action, ...params) => {
        let isRestart = true
        let count  = 0;
        let result = null;
        while (isRestart && count < 5) {
            result = await action(...params).then((value) => {
                isRestart = false
                return value
            }).catch((err) => {
                console.log(err)
                console.log('--------------------Restart---------------------')
            })
            count++;
        }
        return result
    }
    /**
    * Athor: Unmatched Tai Nguyen - Create : 26 /06 /2019 - 20 :19 :07 
    *
    */
    _start = async (url, nameimg) => {
        await this._PageCurrent.goto(url, { waitUntil: 'networkidle0' })
        nameimg && await this._PageCurrent.screenshot({ path: `img/${nameimg}.png` });
    }

    /**
    * Athor: Unmatched Tai Nguyen - Create : 26 /06 /2019 - 21 :38 :13 
    *
    */
    _ClosePage = async () => {
        await this._PageCurrent.close()
    }
    _click = async (selector,action, num) => {
        await Promise.all([
            this._PageCurrent.click(selector),
            action?action():this._PageCurrent.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]).catch((err) => {
            console.log(err)
        });
        num && this._PageCurrent.screenshot({ path: `img/click${num}.png` });

    }
}
module.exports = BaseService