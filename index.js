const puppeteer = require('puppeteer');
const ListWebs = require('./src/ModuleWebPages');
const skill = require('./data/Skill.json')
const fs = require('fs');
// vietnamworks.com, careerlink.vn, careerbuilder,  mywork, vieclam24h, timviecnhanh.com , itviec, topcv

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

// let keys = Object.keys(skill)
// let ChitietLinVucSkill = []

// let linhvuc = keys.map((tmp) => {
//    let item = tmp.toUpperCase()
//     ChitietLinVucSkill.push(...skill[tmp].split(',').map((item => {
//         return {
//             malinhvuc: getSeoTitle(tmp),
//             maskill: getSeoTitle(item),
//             Skills: item.toUpperCase().replace('-','|')
//         }
//     })))

//     return {
//         malinhvuc: getSeoTitle(tmp),
//         ten: item
//     }
// })
// fs.writeFileSync('data/linhvuc.json', JSON.stringify(linhvuc))
// fs.writeFileSync('data/ChitietLinVucSkill.json', JSON.stringify(ChitietLinVucSkill))



(async () => {
    global.logColor = {
        red:(str)=>'\u001b[31m' + str + '\u001b[0m',
        green:(str)=>'\u001b[32m' + str + '\u001b[0m',
        yellow:(str)=>'\u001b[33m' + str + '\u001b[0m',
        blue:(str)=>'\u001b[34m' + str + '\u001b[0m',
        pink:(str)=>'\u001b[35m' + str + '\u001b[0m',
        lightblue:(str)=>'\u001b[36m' + str + '\u001b[0m',
    }
    const browser = await puppeteer.launch(
        {
            // devtools: true,
        });
    for await (let web of ListWebs) {
        let exeWeb = new web(browser)
        await exeWeb.run()
    }
    await browser.close();
})();

