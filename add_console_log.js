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
console.log('找到', vueFiles.length, '个Vue文件');

vueFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative('./src', file);

  // 检查是否已经有console.log了
  if (content.includes('console.log(`打开文件:')) {
    console.log('跳过已处理的:', relativePath);
    return;
  }

  // 添加console.log
  let newContent;
  if (content.includes('<script setup>')) {
    // script setup语法
    if (content.includes('onMounted(')) {
      // 已经有onMounted，在其中添加
      newContent = content.replace(
        /(onMounted\(\s*\(\)\s*=>\s*\{)/,
        '$1\n    console.log(`打开文件: ${location.pathname} -> ' + relativePath + '`);'
      );
    } else {
      // 没有onMounted，添加一个
      const importMatch = content.match(/import.*\{([^}]*)\}.*from.*['"](vue)['"]/);
      if (importMatch) {
        // 已经有Vue相关导入，检查是否包含onMounted
        const imports = importMatch[1];
        if (!imports.includes('onMounted')) {
          // 添加onMounted到导入中
          const newImports = imports.trim().replace(/(\w+)\s*$/, '$1, onMounted');
          newContent = content.replace(
            /import\s*\{([^}]*)\}\s*from\s*['"](vue)['"]/,
            'import { ' + newImports + ' } from \'$2\''
          );
        }
      } else {
        // 需要添加完整的导入
        const scriptStart = content.indexOf('<script setup>');
        newContent = content.slice(0, scriptStart + 14) +
          '\nimport { onMounted } from \'vue\';' +
          content.slice(scriptStart + 14);
      }

      // 添加onMounted钩子
      if (!newContent) newContent = content;
      const scriptEnd = newContent.lastIndexOf('</script>');
      const beforeScriptEnd = newContent.slice(0, scriptEnd);
      newContent = beforeScriptEnd +
        '\n  onMounted(() => {\n    console.log(`打开文件: ${location.pathname} -> ' + relativePath + '`);\n  });\n\n' +
        newContent.slice(scriptEnd);
    }
  } else {
    // 传统Vue组件
    if (content.includes('mounted:')) {
      newContent = content.replace(
        /(mounted:\s*function\s*\(\)\s*\{)/,
        '$1\n      console.log(`打开文件: ${location.pathname} -> ' + relativePath + '`);'
      );
    } else if (content.includes('mounted()')) {
      newContent = content.replace(
        /(mounted\(\)\s*\{)/,
        '$1\n      console.log(`打开文件: ${location.pathname} -> ' + relativePath + '`);'
      );
    } else {
      // 添加mounted钩子
      newContent = content.replace(
        /(export\s+default\s*\{)/,
        '$1\n  mounted() {\n    console.log(`打开文件: ${location.pathname} -> ' + relativePath + '`);\n  },'
      );
    }
  }

  if (newContent && newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log('已处理:', relativePath);
  } else {
    console.log('跳过:', relativePath);
  }
});

console.log('处理完成！');
