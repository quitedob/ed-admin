const fs = require('fs');
const path = require('path');

// 递归查找所有vue文件
function findVueFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && item !== 'node_modules') {
      findVueFiles(fullPath, files);
    } else if (item.endsWith('.vue') && !item.includes('App.vue')) {
      files.push(fullPath);
    }
  }
  return files;
}

const vueFiles = findVueFiles('./src');
console.log('修复', vueFiles.length, '个Vue文件中的路径转义问题');

vueFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative('./src', file).replace(/\\/g, '/');

  // 修复console.log中的路径
  const oldPattern = /console\.log\(`打开文件: \$\{location\.pathname\} -> [^`]*`\);/;
  const newConsoleLog = `console.log(\`打开文件: \${location.pathname} -> ${relativePath}\`);`;

  if (content.includes('console.log(`打开文件:')) {
    content = content.replace(oldPattern, newConsoleLog);
    fs.writeFileSync(file, content);
    console.log('已修复:', relativePath);
  }
});

console.log('修复完成！');
