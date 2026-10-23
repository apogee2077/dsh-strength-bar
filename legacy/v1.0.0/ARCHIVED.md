# V1.0.0 存档 / Archived release

这是「强度滑杆」插件的 **V1.0.0** 原始版本，按要求冻结保留，用于对照与回退：

- `package.json` 的版本保持 `1.0.0`；
- `client.js`、`locale/`、`icon.svg` 等文件与 V1.0.0 发布时逐字节一致；
- 此目录**没有**被 `dsh` profile 的 `link:` 引用，因此不会被加载，也不会和当前版本争抢同一个插件槽位。

## 与 V1.0.1 的差别

V1.0.1 只改了滑杆的几何形状（正圆滑块、半圆端帽轨道与相关命中/填充计算），其余交互与数据逻辑不变。详见 [`../../CHANGELOG.md`](../../CHANGELOG.md)。

## 回退方法

1. 关闭 DSH，或先禁用「强度滑杆」插件；
2. 把本目录里的文件复制回仓库根目录（覆盖 V1.0.1）；
3. 重新打开 DSH。

如果只想临时对照，把 profile（`%USERPROFILE%\.dsh\profiles\<profile>\package.json`）里的
`"@local/dsh-strength-bar"` 依赖改为指向 `legacy/v1.0.0/` 的绝对路径即可。注意同一时间只能启用一个版本。
