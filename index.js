const puppeteer = require('puppeteer');
const VietNameWork = require('./src/ModuleWebPages/VietNameWork');
const JobHop = require('./src/ModuleWebPages/JobHop');
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
    const browser = await puppeteer.launch();

    let test = new VietNameWork(browser)

    await test.run()
    await browser.close();
})();

