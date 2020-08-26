#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const home = require('user-home')
const inquirer = require('inquirer');
const chalk = require('chalk');
const Package = require('../package.json');

program
    .usage('<template-name> [project-name]')
    .version(Package.version)
    // 转义cmd里的参数
    .parse(process.argv);
      

program.on('--help',function(){
    console.log(chalk.green('----------------------------------------------------------'));
    console.log(chalk.green('-         目前只支持: zm-template 和 zm-gulp             -'));
    console.log(chalk.green('-                                                        -'));
    console.log(chalk.green('-         $ zm-init zm-template myProjectName            -'));
    console.log(chalk.green('-                                                        -'));
    console.log(chalk.green("-         $ zm-init zm-gulp myProjectName                -"));
    console.log(chalk.green('----------------------------------------------------------'));
});

function help() {
    // console.log('template 22:');
    return program.help()
}

// 从cmd里，取到用户输入的第一个参数
// 用户想要安装的模板名
let template = program.args[0];
if(!template ) {
    help();
} else if (template.toString() === 'v') {
    console.log(chalk.green('zm-init的版本为：', Package.version));
    return;
} else if ((template.toString() !== 'zm-template' ) && (template.toString() !== 'zm-gulp')) {
    help();
}

// 从cmd里，取到用户输入 的第二个参数
// 用户想要创建的项目名
const rawName = program.args[1];
// 是否在当前目录下创建
// 用户没有输入项目名，或是输入 '.' 就当成是想要在当前目录下创建
const inPlace  = !rawName || rawName === '.';
// 不是当前目录， name为用户输入的项目名
const name = inPlace ? path.relative('../', process.cwd()) : rawName
// 要创建的项目的绝对路径
// 如果没有rawName , 下面这句是 to = path.resolve('.')  得到提，当前文件夹的根目录 ， 即"C:\websites\cx-cli\cx-build-cli2"
const to = path.resolve(rawName || '.');

// 本地模板的路径  从git上拉下的模板，要缓存到本地的
const tempUrl = path.join(home, '.zm-templates', template.replace(/[\/:]/g, '-'));
console.log('temUrl:', tempUrl);
// 在当前目录   或  已经存在此目录 了
if (inPlace || exists(to)) {
    // 询问用户
    inquirer.prompt([{
        // 确认框
        type: 'confirm',
        message: inPlace ? '在当前目录创建项目吗？' : '您要创建的项目名已存在，确定要继续吗？',
        name: 'Ok'
    }]).then(answer => {
        // 回答是的
        // console.log('answer 222222222:', answer);
        // console.log('answer 33333333:', answer.Ok);
        if (answer.Ok) {
            run();
        }

    }).catch(err => {
        // console.log('很抱歉，出错了：', err);
        console.log(chalk.red('很抱歉，出错了1:' + err.toString()))
    });
} else {
    // 既不是当前目录下创建， 也不是已存在的项目名
    run();
}

function run() {
    // git上有的模板有  template
    // const templateUrl = 'louliying/' + template;
    const templateUrl = 'gitlab:http://git01.dds.com:louliying/' + template;
    // const templateUrl = 'gitlab:git@git01.dds.com:louliying/' + template + '.git';
    console.log('user new templateUrl 222:', templateUrl);
    // 下载模板 并 生成项目
    downloadAndGenerate(templateUrl);
}

function downloadAndGenerate(temp) {
    // 如果已经存在本地的模板，则删除
    const spinner = ora('downloading template.\n')
    spinner.start()
    if (exists(tempUrl)) {
        rm(tempUrl);
    }

    download(temp, tempUrl, {clone: false}, err =>{
        // console.log('temp 22222222:', temp);
        // console.log('tempUrl 333333333:', tempUrl);
        // console.log('err 44444444:', err);
         spinner.stop()
        if (err) {
            console.log('很抱歉，出错了：', err);
            // console.log(chalk.red('很抱歉，出错了2:' + err.toString()))
        }
        generate(name, tempUrl, to, err => {
            if (err) {
                console.log('很抱歉，出错了：', err);
                // console.log(chalk.red('很抱歉，出错了3:' + err.toString()))
            }
        })
    })
}