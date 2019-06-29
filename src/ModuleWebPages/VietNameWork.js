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
    slug = slug.replace(/[`~!@#$%^&*()+=,./?><'":;_\\/]/gi, '');
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
class VietNameWork extends BaseService {
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
        let index = 3
        let pageCurrent = 1
        let LinkJobDetail = []
        console.log("Start Get Link Job Detail")

        while (!isStop) {

            const tmp = await this.GetListLinks('.job-item-info',
                (item) => {
                    return item.querySelector('h3 a').getAttribute('href')
                },
                (item) => {
                    let luong = item.querySelector('div:nth-child(2) span:nth-child(2) strong').innerText.trim()
                    return /[0-9]/.test(luong)
                })

            LinkJobDetail.push(...tmp)

            /**
             * =====================================================
             */

            const CurrentText = await this._PageCurrent.evaluate(() => {
                return document.querySelector('.job-item h3').innerText
            })

            let tmps = await this._PageCurrent.evaluate(() => {
                let tmps = document.querySelectorAll('a.ais-pagination--link')
                let datas = []
                for (let i = 0; i < tmps.length; i++) {
                    datas.push(tmps[i].innerText)
                }
                return datas
            })

            for (let i = 0; i < tmps.length; i++) {
                if (tmps[i] == pageCurrent) {
                    index = i + 5
                    pageCurrent = tmps[i + 1]
                    break;
                }
            }

            if (index == 10) break

            await this._PageCurrent.click(`.ais-pagination.pagination.pagination-lg li:nth-child(${index}) a`)

            await this._PageCurrent.waitFor((CurrentText) => {
                return document.querySelector('.job-item h3').innerText !== CurrentText
            }, {}, CurrentText)

        }
        return LinkJobDetail
    }


    /**
    * Athor: Unmatched Tai Nguyen - Create : 27 /06 /2019 - 14 :22 :52 
    *
    */
    _GetInfoPageJob = async (page, url, num) => {
        url = 'https://www.vietnamworks.com' + url
        console.log('connect to :', url)

        await this.Loop(this.start, url)

        // await page.screenshot(`img/${'pagejob'}.png`)


        let res = await this.GetDataWithStruct(this._PageCurrent, {
            MaCongTy: () => {
                let taget = document.querySelector('.company-name a')
                return taget?taget.innerText.trim():''
            },
            TenCongTy: () => {
                let taget = document.querySelector('.company-name a')
                return taget?taget.innerText.trim():''
            },
            Luong: () => {
                let taget = document.querySelector('.salary strong')

                let Salarys = /\d+/.exec((taget?taget.innerText:'0,0').replace(/'\$'/gi))
                if (Salarys == null) Salarys = []
                Salarys[0] = (+Salarys[0] || 0)
                Salarys[1] = (+Salarys[1] || 0)
                return {
                    LuongToiThieu: Salarys[0],
                    LuongToiDa: Salarys[1]
                }
            },
            lstSkill: () => {
                let taget = document.querySelector('.box-summary.link-list div:nth-child(4) .summary-content span:nth-child(2)')
                if(!taget) return []
                let lstSkill = taget.innerText.trim().split(',')
                return lstSkill.map(item => {
                    return {
                        MaSkill: item,
                        TenSkill: item
                    }
                })
            }

        })

        res.MaCongTy = getSeoTitle(res.MaCongTy)

        for (let i = 0; i < res.lstSkill.length; i++) {
            res.lstSkill[i].MaSkill = getSeoTitle(res.lstSkill[i].MaSkill)

        }

        return res
    }
    Login = async () => {
        return await this.LoginBase(
            {
                urlLogin: 'https://secure.vietnamworks.com/login/vi?client_id=3',
                InputAccout: '#email',
                InputPass: '#login__password',
                BtnSumit: '#button-login'
            }, {
                Acount: 'tainguyen.ntt.97@gmail.com',
                PassWord: 'GialonG1'
            })
    }
    _run = async () => {
        await this.Init()
        await this.Login()
        //get Links JobDetail

            console.log('connect Page search success')
            await this.Loop(this.start, 'https://www.vietnamworks.com/viec-lam-it-phan-mem-i35-vn', 'page search')

            let LinkJobDetail = await this.GetLinkPage()

            console.log(LinkJobDetail)

           fs.writeFileSync('data/LinkJobDetailVietNameWork.json', JSON.stringify(LinkJobDetail));

        //=====================
        // let LinkJobDetail = JSON.parse(fs.readFileSync('data/LinkJobDetailVietNameWork.json', 'utf8'))

        let lstQuocGia = [
            { MaQuocGia: "viet-nam", TenQuocGia: "Viet Nam" },
            { TenQuocGia: "eng", TenQuocGia: "ENG" }
        ]

        fs.writeFileSync('data/quocgia.json', JSON.stringify(lstQuocGia))

        let lstConty = JSON.parse(fs.readFileSync('data/Congtys.json', 'utf8'))
        let index = 0
        let length = LinkJobDetail.length

        while (LinkJobDetail.length > 0) {
            let Conty = await this.Loop(this.GetInfoPageJob, this._PageCurrent, LinkJobDetail.shift())
            lstConty.push(Conty)
            index++
            console.log('Saved index', index, '/', length)
            fs.writeFileSync('data/Congtys.json', JSON.stringify(lstConty))
            console.log(Conty)
        }

        fs.writeFileSync('data/Congtys.json', JSON.stringify(lstConty))
    }
}
module.exports = VietNameWork