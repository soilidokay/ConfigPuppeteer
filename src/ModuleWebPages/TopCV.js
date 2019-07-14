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
class TopCV extends BaseService {
    constructor(browser) {
        super(browser)
        this.run = this._run.bind(this)
        this.GetLinkPage = this._GetLinkPage.bind(this)
        this.GetIndex = this._GetIndex.bind(this)
        this.GetInfoPageJob = this._GetInfoPageJob.bind(this)
        this.GetListLinks = this._GetListLinks.bind(this)
    }


    /**
        * Athor: Unmatched Tai Nguyen - Create : 29 /06 /2019 - 16 :08 :33 
        *Hàm select nhiều item với tham số @param ItemSelector 
        *Tham số @param GetData là một phương thức nhận các từng item từ việc select
        * Tham số @param Filter là phương thức đinh nghĩa việc lộc dữ liệu
        */
    _GetListLinks = async (ItemSelector, GetData, Filter) => {

        Filter = Filter ? Filter : (item) => true

        console.log("......... Start Get Link Job Detail one page")

        const ActionSelect = (ItemSelector, GetData, Filter) => {

            let tmps = document.querySelectorAll(ItemSelector)
            let datas = []
            for (let i = 0; i < tmps.length; i++) {
                if (Filter(tmps[i])) {
                    datas.push(GetData(tmps[i]))
                }
            }
            return datas

        }
        const tmp = await this.newEvaluate(this._PageCurrent, ActionSelect, ItemSelector, GetData, Filter)
        // console.log(tmp)
        return tmp
    }

    /**
    * Athor: Unmatched Tai Nguyen - Create : 27 /06 /2019 - 01 :04 :07 
    *
    */
    _GetIndex = async () => {

    }

    /**
    * Athor: Unmatched Tai Nguyen - Create : 26 /06 /2019 - 22 :17 :08 
    *
    */
    _GetLinkPage = async () => {
        let isStop = false
        let index = 0
        let pageNext = '2'
        let LinkJobDetail = []
        console.log("Start Get Link Job Detail")

        while (!isStop) {
            console.log(`.........connect page : ${pageNext-1}  Link Job Detail one page`)

            const tmp = await this.GetListLinks('.job-list.search-result>div',
                (item) => {
                    return item.querySelector('.job-title a').getAttribute('href')
                },
                (item) => {
                    let luong = item.querySelector('#row-result-info-job .salary').innerText.trim()
                    return /[0-9]/.test(luong)
                })

            LinkJobDetail.push(...tmp)

            /**
             * =====================================================
             */

            let tmps = await this._PageCurrent.evaluate(() => {
                let tmps = document.querySelectorAll('.pagination>li')
                let datas = []
                for (let i = 0; i < tmps.length; i++) {
                    datas.push(tmps[i].innerText)
                }
                return datas
            })

            for (let i = 0; i < tmps.length; i++) {
                if (tmps[i] == pageNext) {
                    index = i + 1
                    pageNext++;
                    break;
                }
            }

            if (
                await this._PageCurrent.evaluate((index) => {
                    return !document.querySelector(`.pagination>li:nth-child(${index})>a`)
                },index)
            ){
                break;
            }

            await this.click(`.pagination>li:nth-child(${index})>a`)
            //   await this._PageCurrent.screenshot({ path: `img/${index}.png` ,fullPage:true});

        }
        console.log("End Get Link Job Detail")

        return LinkJobDetail
    }


    /**
    * Athor: Unmatched Tai Nguyen - Create : 27 /06 /2019 - 14 :22 :52 
    *
    */
    _GetInfoPageJob = async (page, url,callback, num) => {
        console.log('connect to :', url)

        await this.Loop(this.start, url)

        // await page.screenshot(`img/${'pagejob'}.png`)

        let res = await this.GetDataWithStruct(this._PageCurrent, {
            MaCongTy: () => {
                let taget = document.querySelector('.company-title')
                return taget ? taget.innerText.trim() : ''
            },
            TenCongTy: () => {
                let taget = document.querySelector('.company-title')
                return taget ? taget.innerText.trim() : ''
            },
            Luong: () => {
                let taget = document.querySelector('#box-info-job .job-info-item:nth-child(1) span')

                let Salarys = (taget ? taget.innerText : '0,0').replace(/\$|\./gi, '').match(/\d+/g)
                if (Salarys == null) Salarys = []
                Salarys[0] = (+Salarys[0] || 0)
                Salarys[1] = (+Salarys[1] || 0)
                return {
                    LuongToiThieu: Salarys[0]*1000000,
                    LuongToiDa: Salarys[1]*1000000
                }
            },
            lstSkilltext: () => {
                let taget = document.querySelector('#col-job-left')
                if (!taget) return 'none'
                let lstSkill = taget.innerText.trim()
                return lstSkill
            }

        })
        return callback ? callback(res) : res
    }

    Login = async () => {
        return await this.LoginBase(
            {
                urlLogin: 'https://www.topcv.vn/login',
                InputAccout: '#form-login input[name="email"]',
                InputPass: '#form-login input[name="password"]',
                BtnSumit: '#form-login input[type="submit"]'
            }, {
                Acount: 'AnounymousScan@gmail.com',
                PassWord: 'Scan123@'
            })
    }

    _run = async () => {
        await this.Init()
        await this.Login()
        //get Links JobDetail
      //  await this._PageCurrent.screenshot({ path: `img/${'loginTopCV'}.png` });

        // console.log('connect Page search success')
        // await this.Loop(this.start, 'https://www.topcv.vn/viec-lam/it-phan-mem-c10026.html?salary=0&exp=0&page=1', 'page search')

        // let LinkJobDetail = await this.GetLinkPage()

        // console.log(LinkJobDetail)

        //  fs.writeFileSync('data/LinkJobDetailTopCV.json', JSON.stringify(LinkJobDetail));

        //=====================
        let LinkJobDetail = JSON.parse(fs.readFileSync('data/LinkJobDetailTopCV.json', 'utf8'))

       
        let Skills = require('../../data/ChitietLinVucSkill.json')

        let index = 0
        let lstJobs = []
        let length = LinkJobDetail.length


        while (LinkJobDetail.length > 0) {

            let url = LinkJobDetail.shift()


            let Jobs = await this.Loop(
                this.GetInfoPageJob,
                this._PageCurrent,
                url,
                (res) => {

                    res.MaCongTy = getSeoTitle(res.MaCongTy)
                    res.link = url

                    let maSkills = this.CheckSkill(res.lstSkilltext, Skills)
                    res.lstSkill = maSkills.listkill
                    res.linhvuc = maSkills.linhvuc
                    return res
                }
            )

            
            lstJobs.push(Jobs)
            index++
          
            lstJobs.push(Jobs)
            console.log('Saved index', index, '/', length)
            fs.writeFileSync('data/lstTopCVp.json', JSON.stringify(lstJobs))
            console.log(Jobs)
        }

        fs.writeFileSync('data/lstTopCVp.json', JSON.stringify(lstJobs))
    }
}
module.exports =  TopCV