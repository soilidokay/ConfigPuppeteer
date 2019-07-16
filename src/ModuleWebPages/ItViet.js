const BaseService = require('./BaseService')
const fs = require('fs');
getSeoTitle = (input) => {
    if (input == undefined || input == '')
        return '';
    //Đổi chữ hoa thành chữ thường
    var slug = input.trim().toLowerCase();

    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/[áàảạãăắằẳẵặâấầẩẫậ]/gi, 'a');
    slug = slug.replace(/[éèẻẽẹêếềểễệ]/gi, 'e');
    slug = slug.replace(/[iíìỉĩị]/gi, 'i');
    slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/gi, 'o');
    slug = slug.replace(/[úùủũụưứừửữự]/gi, 'u');
    slug = slug.replace(/[ýỳỷỹỵ]/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/[`~!@$%^&*()+=,./?><'":;_\\/]/gi, '');
    //Đổi khoảng trắng thành ký tự gạch ngang
    slug = slug.replace(/ /gi, "-");
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/[-]+/gi, '-');

    return slug;
}
/**
* Athor: Unmatched Tai Nguyen - 26 /06 /2019 - 20 :13 :07 
*
*/
class ITViet extends BaseService {
    constructor(browser) {
        super(browser)




        this.run = this._run.bind(this)
        this.GetLinkPage = this._GetLinkPage.bind(this)
        this.GetIndex = this._GetIndex.bind(this)
        this.GetInfoPageJob = this._GetInfoPageJob.bind(this)
        this.IntItviec = this._IntItviec.bind(this)
        this.GetLinkPages = this._GetLinkPages.bind(this)
        this._LinkSearchPage = [
            'https://itviec.com/viec-lam-it/ho-chi-minh-hcm',
            'https://itviec.com/viec-lam-it/ha-noi',
            'https://itviec.com/viec-lam-it/da-nang',
            'https://itviec.com/viec-lam-it/others'
        ]
    }


    /**
    * Athor: Unmatched Tai Nguyen - Create : 15 /07 /2019 - 14 :37 :11 
    *
    */
    _IntItviec = async () => {
        const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
            'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
        await this._PageCurrent.setUserAgent(userAgent);
    }

    /**
    * Athor: Unmatched Tai Nguyen - Create : 27 /06 /2019 - 01 :04 :07 
    *
    */
    _GetIndex = async () => {

    }

    /**
    * Athor: Unmatched Tai Nguyen - Create : 15 /07 /2019 - 17 :41 :36 
    *
    */
    _GetLinkPage = async (item) => {
        console.log(item)
        console.log(`connect to :${item}`)
        await this.Loop(this.start, item);
        await this._PageCurrent.screenshot({ path: `img/click${'Itviet'}.png`, fullPage: true });

        let tmp = await this._PageCurrent.evaluate(() => {
            return document.querySelector('#show_more') != null
        })

        if (tmp) {

            let TxtMore = tmp = await this._PageCurrent.evaluate(() => {
                return document.querySelector('#show_more a').innerText
            })
            do {

                await this._PageCurrent.waitFor((TxtMore) => {
                    let eleMore = document.querySelector('#show_more');
                    return !eleMore || eleMore.querySelector('a').innerText != TxtMore
                }, TxtMore)

                await this.Sleep(1)

                tmp = await this._PageCurrent.evaluate(() => {
                    return document.querySelector('#show_more') != null
                })
                if (tmp) {
                    // this._PageCurrent.click('#show_more a',{delay :300});
                    await this._PageCurrent.evaluate(() => {
                        let eleClick = document.querySelector('#show_more a')
                        eleClick && eleClick.click()
                    })

                }
            } while (tmp)
        }

        let tmps = await this._PageCurrent.evaluate(() => {

            let tmps = document.querySelectorAll('#jobs .job') || [];
            let links = []
            for (let i = 0; i < tmps.length; i++) {
                let salaryEle = tmps[i].querySelector('.salary span:nth-child(2)')
                console.log(salaryEle)
                if (salaryEle && /[0-9]/.test(salaryEle.innerText)) {
                    links.push('https://itviec.com' + tmps[i].querySelector('.title a').getAttribute('href'))
                }
            }
            return links

        })
        return tmps
    }
    /**
    * Athor: Unmatched Tai Nguyen - Create : 26 /06 /2019 - 22 :17 :08 
    *
    */
    _GetLinkPages = async () => {
        /**
         * Conect to page
         */
        let LinkJobDetail = []
        console.log('.......Start get Link')

        for (let item of this._LinkSearchPage) {
            let tmps = await this.Loop(this.GetLinkPage, item)
            LinkJobDetail.push(...tmps)
        }

        console.log('.......End get Link')

        return LinkJobDetail
    }


    /**
    * Athor: Unmatched Tai Nguyen - Create : 27 /06 /2019 - 14 :22 :52 
    *
    */
    _GetInfoPageJob = async (page, url, callback, num) => {
        console.log('connect to :', url)

        await this.Loop(this.start, url)

        // await page.screenshot(`img/${'pagejob'}.png`)

        let res = await this.GetDataWithStruct(this._PageCurrent, {
            MaCongTy: () => {
                let taget = document.querySelector('.side_bar .employer-info')
                return taget ? taget.innerText.trim() : ''
            },
            TenCongTy: () => {
                let taget = document.querySelector('.side_bar .employer-info')
                return taget ? taget.innerText.trim() : ''
            },
            Luong: () => {
                let taget = document.querySelector('.job-detail .salary .salary-text')

                let Salarys = (taget ? taget.innerText : '0,0').replace(/[$,.]/gi, '').match(/\d+/g)
                if (Salarys == null) Salarys = []
                Salarys[0] = (+Salarys[0] || 0)
                Salarys[1] = (+Salarys[1] || 0)
                return {
                    LuongToiThieu: Salarys[0],
                    LuongToiDa: Salarys[1]
                }

            },
            lstSkillText: () => {
                let eleLi = document.querySelector('.job-detail .skills_experience')
                return eleLi.innerText;
            }

        })


        return callback ? callback(res) : res
    }
    Login = async () => {
        let Query = {
            urlLogin: 'https://itviec.com',
            InputAccout: 'form[data-controller="users--sign-in"] input[type="email"]',
            InputPass: 'form[data-controller="users--sign-in"] input[type="password"]',
            BtnSumit: 'form[data-controller="users--sign-in"] input[type="submit"]'
        }
        let Info = {
            Acount: 'soilidokay1@gmail.com',
            PassWord: 'Scan123@'
        }

        console.log('Start login Browser :' + Query.urlLogin)
        await this.start(Query.urlLogin, 'Page Login')

        await this._PageCurrent.evaluate((Query, Info) => {
            document.querySelector(Query.InputAccout).value = Info.Acount;
            document.querySelector(Query.InputPass).value = Info.PassWord;
            document.querySelector(Query.BtnSumit).click()
        }, Query, Info)

        // await this.SendInputtag(Query.InputAccout, Info.Acount)
        // await this.SendInputtag(Query.InputPass, Info.PassWord)

        await this._PageCurrent.waitForNavigation({ waitUntil: 'networkidle2' }),

            await this._PageCurrent.screenshot({ path: 'img/loginvietnamwork.png' });

        // await this.ClosePageCurrent()
        console.log('End login Browser')
    }




    _run = async () => {
        await this.Init()
        await this.IntItviec()
        await this.Login()
        //get Links JobDetail

        let LinkJobDetail = await this.GetLinkPages()

        console.log(LinkJobDetail)

        fs.writeFileSync('data/LinkJobDetailItViet.json', JSON.stringify(LinkJobDetail));

        // //=====================
        //  let LinkJobDetail = JSON.parse(fs.readFileSync('data/LinkJobDetailItViet.json', 'utf8'))
        let Skills = require('../../data/ChitietLinVucSkill.json')

        let length = LinkJobDetail.length
        let index = 0
        let lstJobs = []

        while (LinkJobDetail.length > 0) {

            let url = LinkJobDetail.shift()
            console.log(logColor.lightblue('-------------------------------@Start@----------------------------'));

            let Jobs = await this.Loop(
                this.GetInfoPageJob,
                this._PageCurrent,
                url,
                (res) => {

                    res.MaCongTy = getSeoTitle(res.MaCongTy)
                    res.link = url

                    let maSkills = this.CheckSkill(res.lstSkillText, Skills)

                    if (maSkills.listkill.length < 1) return null

                    res.lstSkill = maSkills.listkill
                    res.linhvuc = maSkills.linhvuc
                    return res
                }
            )

            index++
            if (Jobs) {
                lstJobs.push(Jobs)
                console.log(Jobs)
                fs.writeFileSync('DataJobs/DataItViet.json', JSON.stringify(lstJobs))
                console.log(logColor.green('Saved index'), index, '/', length);
            } else {

                console.log(logColor.red('cannot be classified!!!'));

                console.log(logColor.yellow('can\'t save index'), index, '/', length);
            }
            console.log(logColor.lightblue('-------------------------------@End@----------------------------'));
        }

    }
}
module.exports = ITViet