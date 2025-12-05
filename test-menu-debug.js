// 测试脚本 - 检查不同角色的菜单配置
import { getMenuListByRole, getPermissionsByRole, ROLE_INFO } from './src/config/roleMenuConfig.js';

console.log('=== 角色菜单配置测试 ===');

// 测试管理员角色
console.log('\n1. 管理员角色:');
const adminMenu = getMenuListByRole('admin');
console.log('菜单数量:', adminMenu.length);
console.log('班级管理菜单:', adminMenu.find(m => m.path === '/class'));
console.log('作业管理菜单:', adminMenu.find(m => m.path === '/homework'));
console.log('题库管理菜单:', adminMenu.find(m => m.path === '/assignments'));

// 测试班主任角色
console.log('\n2. 班主任角色:');
const headTeacherMenu = getMenuListByRole('headTeacher');
console.log('菜单数量:', headTeacherMenu.length);
console.log('班级管理菜单:', headTeacherMenu.find(m => m.path === '/class'));
console.log('作业管理菜单:', headTeacherMenu.find(m => m.path === '/homework'));
console.log('题库管理菜单:', headTeacherMenu.find(m => m.path === '/assignments'));

// 测试老师角色
console.log('\n3. 老师角色:');
const teacherMenu = getMenuListByRole('teacher');
console.log('菜单数量:', teacherMenu.length);
console.log('班级管理菜单:', teacherMenu.find(m => m.path === '/class'));
console.log('作业管理菜单:', teacherMenu.find(m => m.path === '/homework'));
console.log('题库管理菜单:', teacherMenu.find(m => m.path === '/assignments'));

console.log('\n=== 测试完成 ===');