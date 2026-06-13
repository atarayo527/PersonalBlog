# Episode33 页面流程图

## 1. 页面导航流程图

```mermaid
flowchart TD
    A[首页 · 文章列表] --> B{用户操作}
    
    B -->|点击分类按钮| C[筛选后的列表]
    B -->|输入搜索关键词| D[搜索结果列表]
    B -->|点击文章 / 阅读| E[文章详情页]
    B -->|点击暗色切换| F[首页 · 暗色模式]
    
    C -->|点击文章| E
    C -->|切换分类| C
    C -->|清空/点击全部| A
    
    D -->|点击文章| E
    D -->|清空搜索| A
    
    E -->|← 返回列表| A
    E -->|提交评论| E
    E -->|点赞 / 转发| E
    E -->|暗色切换| G[详情页 · 暗色模式]
    
    F -->|点击文章| G
    F -->|切换回浅色| A
    
    G -->|← 返回列表| F
    G -->|切换回浅色| E
    
    style A fill:#fefefb,stroke:#1a1a1a,color:#1a1a1a
    style E fill:#fefefb,stroke:#c41e3a,color:#1a1a1a
    style F fill:#111110,stroke:#e8e4dc,color:#e8e4dc
    style G fill:#111110,stroke:#c41e3a,color:#e8e4dc
    style C fill:#fafaf6,stroke:#888,color:#1a1a1a
    style D fill:#fafaf6,stroke:#888,color:#1a1a1a
```

## 2. 页面结构图（PC 端三栏布局）

```mermaid
block-beta
    columns 3
    
    block:top:3
        columns 1
        t1["顶栏 strip · 日期 | 期号 | 搜索 | 浅/暗"]
    end
    
    block:header:3
        columns 1
        t2["刊头 masthead · Episode 33"]
        t3["导航 nav · 文章 | 关于 | 归档"]
    end
    
    block:body:3
        block:left
            l1["◆ 分类"]
            l2["■ 全部"]
            l3["□ 生活"]
            l4["□ 摘抄"]
            l5["□ 心情"]
            l6["───"]
            l7["共 N 篇文章"]
        end
        
        block:center
            c1["第十三期 ─── 2025年6月"]
            c2["01 ◆专题 代码 · 文章标题 · 摘要 · ♡42 ↗12"]
            c3["02 设计 · 文章标题 · 摘要"]
            c4["03 随笔 · 文章标题 · 摘要"]
            c5["第十二期 ─── 2025年5月"]
            c6["04 代码 · 文章标题 · 摘要"]
            c7["05 随笔 · 文章标题 · 摘要"]
            c8["更早的期号 →"]
        end
        
        block:right
            r1["◆ 互动"]
            r2["精选评论引用"]
            r3["评论表单"]
            r4["───"]
            r5["标签云"]
        end
    end
    
    block:footer:3
        columns 1
        f1["页脚 footer · Episode33 | 独立出版 | 2025"]
    end

    left style fill:#fafaf6
    center style fill:#fefefb
    right style fill:#fafaf6
```

## 3. 文章详情页结构

```mermaid
block-beta
    columns 3
    
    block:top:3
        columns 1
        t1["顶栏 · 日期 | 期号 | 搜索 | 浅/暗"]
    end
    
    block:main:3
        block:ls
            l1["◆ 分类"]
            l2["■ 全部 □ 生活"]
        end
        
        block:detail
            d1["← 返回列表"]
            d2["01 ◆专题 分类"]
            d3["文章完整标题"]
            d4["多段落正文内容..."]
            d5["─── 点赞 | 转发 | 评论数"]
            d6["◆ 评论 N"]
            d7["读者A: 评论内容"]
            d8["读者B: 评论内容"]
            d9["[___________] 发布"]
        end
        
        block:rs
            r1["◆ 互动"]
            r2["标签云"]
        end
    end
    
    block:footer:3
        columns 1
        f1["页脚 · Episode33 · 独立出版"]
    end

    style d2 fill:#fefefb,stroke:#c41e3a
```

## 4. 响应式布局变化

```mermaid
flowchart LR
    subgraph PC["PC > 1024px"]
        direction TB
        pc1["三栏 Grid"]
        pc2["140px | 1fr | 170px"]
        pc3["左: 垂直分类筛选"]
        pc4["中: 文章列表 + 详情"]
        pc5["右: 互动区 + 标签"]
    end
    
    subgraph Tablet["平板 768-1024px"]
        direction TB
        t1["双栏 Grid"]
        t2["110px | 1fr"]
        t3["底部: 互动区两列横排"]
    end
    
    subgraph Phone["手机 < 768px"]
        direction TB
        ph1["单栏"]
        ph2["分类: 横向滚动条"]
        ph3["文章: 全宽单列"]
        ph4["互动: 底部纵向"]
    end
    
    PC --> Tablet --> Phone
```

## 5. 交互状态流转

```mermaid
stateDiagram-v2
    [*] --> 列表视图
    
    state 列表视图 {
        [*] --> 全部文章
        全部文章 --> 筛选结果 : 点击分类
        全部文章 --> 搜索结果 : 输入搜索
        筛选结果 --> 全部文章 : 点击"全部"
        搜索结果 --> 全部文章 : 清空搜索框
        筛选结果 --> 搜索结果 : 输入搜索
    }
    
    列表视图 --> 详情视图 : 点击文章/阅读
    
    state 详情视图 {
        [*] --> 文章展示
        文章展示 --> 评论提交 : 输入评论+发布
        评论提交 --> 文章展示
        文章展示 --> 点赞更新 : 点击心形
        点赞更新 --> 文章展示
    }
    
    详情视图 --> 列表视图 : 点击返回
    
    state 暗色模式 {
        列表视图暗色 : 列表视图在暗色下
        详情视图暗色 : 详情视图在暗色下
    }
    
    列表视图 --> 暗色模式 : 切换暗色
    详情视图 --> 暗色模式 : 切换暗色
    暗色模式 --> 列表视图 : 切换浅色
    暗色模式 --> 详情视图 : 切换浅色
```

## 6. 数据流图

```mermaid
flowchart LR
    subgraph 存储["localStorage"]
        s1["blog-theme
            light | dark"]
        s2["blog-post-comments
            {postId: [{name, content, time}]}"]
        s3["blog-likes
            {postId: count}"]
        s4["blog-shares
            {postId: count}"]
        s5["blog-sidebar-comments
            [{content, time}]"]
    end
    
    subgraph 界面["用户界面"]
        u1["暗色切换按钮"] -->|读写| s1
        u2["详情页评论区"] -->|读写| s2
        u3["点赞按钮"] -->|读写| s3
        u4["转发按钮"] -->|读写| s4
        u5["侧边栏留言"] -->|读写| s5
    end
    
    subgraph 展示["数据展示"]
        d1["CSS 变量驱动主题"]
        d2["按 postId 渲染评论列表"]
        d3["显示点赞计数"]
        d4["显示转发计数"]
        d5["显示侧边栏留言"]
    end
    
    s1 --> d1
    s2 --> d2
    s3 --> d3
    s4 --> d4
    s5 --> d5
```
