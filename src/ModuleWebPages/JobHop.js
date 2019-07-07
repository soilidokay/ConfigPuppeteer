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
class JobHop extends BaseService {
    constructor(browser) {
        super(browser)
        this.run = this._run.bind(this)
        this.GetLinkPage = this._GetLinkPage.bind(this)
        this.GetIndex = this._GetIndex.bind(this)
        this.GetInfoPageJob = this._GetInfoPageJob.bind(this)
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

        await this.Loop(this.start, 'https://www.jobhop.vn/vi');
        console.log('connect to page search succsess')
        let tmp = null
        await this._PageCurrent.click('.top-industries ul li div')
        await this._PageCurrent.waitFor(() => {
            return document.querySelector('.job-list h4 a') !== null
        })

        do {
            await this.click('.jobs-holder.container .primary-button.button span',
                () => {
                    return this._PageCurrent.waitFor(() => {
                        return document.querySelectorAll('#app > div').length < 2
                    })
                }
            );
            tmp = await this._PageCurrent.evaluate(() => {
                return document.querySelector('.jobs-holder.container .primary-button.button span') != null
            })
        } while (tmp)

        // await this._PageCurrent.screenshot({ path: `img/click${'jobhop'}.png` });
        let LinkJobDetail = await this._PageCurrent.evaluate(() => {
            let tmps = document.querySelectorAll('.job-list .row.job-list-item');
            let links = []
            for (let i = 0; i < tmps.length; i++) {
                let salaryEle = tmps[i].querySelector('p span:nth-child(3)')
                if (salaryEle && /[0-9]/.test(salaryEle.innerText)) {
                    links.push('https://www.jobhop.vn' + tmps[i].querySelector('h4 a').getAttribute('href'))
                }
            }
            return links
        })
        return LinkJobDetail
    }


    /**
    * Athor: Unmatched Tai Nguyen - Create : 27 /06 /2019 - 14 :22 :52 
    *
    */
    _GetInfoPageJob = async (page, url, num) => {
        console.log('connect to :', url)

        await this.Loop(this.start, url)

        // await page.screenshot(`img/${'pagejob'}.png`)

        let res = await this.GetDataWithStruct(this._PageCurrent, {
            MaCongTy: () => {
                let taget = document.querySelector('#job-detail .body.container table tr td:nth-child(2)')
                return taget ? taget.innerText.trim() : ''
            },
            TenCongTy: () => {
                let taget = document.querySelector('#job-detail .body.container table tr td:nth-child(2)')
                return taget ? taget.innerText.trim() : ''
            },
            Luong: () => {
                let taget = document.querySelector('#job-detail .body.container table tr:nth-child(2) td:nth-child(2)')

                let Salarys = /\d+/.exec((taget ? taget.innerText : '0,0').replace(/\$|[.]/gi, ''))
                if (Salarys == null) Salarys = []
                Salarys[0] = (+Salarys[0] || 0)
                Salarys[1] = (+Salarys[1] || 0)
                return {
                    LuongToiThieu: Salarys[0],
                    LuongToiDa: Salarys[1]
                }

            },
            lstSkill: () => {
                let eleLi = document.querySelectorAll('#job-detail .body.container > section')[1]
                return eleLi.innerText;
            }
            // lstSkill: () => {
            //     let taget = document.querySelector('.box-summary.link-list div:nth-child(4) .summary-content span:nth-child(2)')
            //     if (!taget) return []
            //     let lstSkill = taget.innerText.trim().split(',')
            //     return lstSkill.map(item => {
            //         return {
            //             MaSkill: item,
            //             TenSkill: item
            //         }
            //     })
            // }

        })

        res.MaCongTy = getSeoTitle(res.MaCongTy)
        res.link = url
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
        //get Links JobDetail


        // let LinkJobDetail = await this.GetLinkPage()

        // console.log(LinkJobDetail)

        // fs.writeFileSync('data/LinkJobDetailJobHop.json', JSON.stringify(LinkJobDetail));

        // //=====================
        let LinkJobDetail = JSON.parse(fs.readFileSync('data/LinkJobDetailJobHop.json', 'utf8'))
        let Skills = require('../../data/ChitietLinVucSkill.json')

        let length = LinkJobDetail.length
        let index = 0
        let lstJobs = []
        while (LinkJobDetail.length > 0) {
            let Jobs = await this.Loop(this.GetInfoPageJob, this._PageCurrent, LinkJobDetail.shift())
            index++

            let maSkills = new Set()

            Skills.forEach(skill => {
                let strRegex = new RegExp(skill.Skills)
                if (strRegex.test(Jobs.lstSkill.toUpperCase())) {
                    console.log(skill.maskill)
                    maSkills.add(skill.maskill)
                }
            })

            Jobs.lstSkill = maSkills.size > 0 ? [...maSkills] : []
            lstJobs.push(Jobs)
            console.log('Saved index', index, '/', length)
            fs.writeFileSync('data/lstJobsHop.json', JSON.stringify(lstJobs))
            console.log(Jobs)
        }

        fs.writeFileSync('data/lstJobsHop.json', JSON.stringify(lstJobs))

    }
}
module.exports = JobHop