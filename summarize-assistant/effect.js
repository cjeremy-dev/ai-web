const headHeight = 40;
/**
 * 添加dom style属性
 * @param dom
 * @param attr
 * @param value
 */

function addStyle(dom, attr, value) {
  if (dom) {
    dom.style[attr] = value;
  }
}

function addNodeListStyle(domList, attr, value) {
  domList.forEach((dom) => {
    addStyle(dom, attr, value);
  });
}

function followScroll() {
  const docsContainer = document.getElementById('docs-container');
  const clientRect = docsContainer?.getBoundingClientRect();
  const { innerHeight } = window;
  const top = clientRect?.top || 0;
  const aliyunDocsToc = document.querySelector('.aliyun-docs-toc-content'); // 目录树
  const aliyunDocsSynopsis = document.querySelector('.aliyun-docs-side-content'); // 正文右侧区域
  const aliyunDocsRightBox = document.querySelector('.aliyun-docs-side-blank'); // 右侧容器
  const aliyunDocsMenuSearch = document.querySelector('.aliyun-docs-menu-search'); // 目录筛选区域
  const fixedTop = `${headHeight - innerHeight + Number(clientRect?.bottom)}px`;
  const menuSearchOffset = 100 + headHeight;
  if (top <= 0) {
    docsContainer?.classList?.add('fixed');
    if (Number(clientRect?.bottom) < innerHeight) {
      addNodeListStyle([aliyunDocsToc, aliyunDocsSynopsis], 'top', fixedTop);
      addStyle(aliyunDocsMenuSearch, 'top', `${menuSearchOffset - innerHeight + Number(clientRect?.bottom)}px`);
    } else {
      addNodeListStyle([aliyunDocsToc, aliyunDocsSynopsis], 'top', `${headHeight}px`);
      // 导读固定时，高度为100vh-子导航高度
      addNodeListStyle([aliyunDocsSynopsis], 'height', `calc(100vh - ${headHeight}px )`);
      addStyle(aliyunDocsMenuSearch, 'top', `${menuSearchOffset}px`);
    }
  } else {
    docsContainer?.classList?.remove('fixed');
    addNodeListStyle([aliyunDocsToc, aliyunDocsSynopsis], 'top', '0px');
    // 导读未固定时，目录树高度为100vh-子导航高度-距离顶部高度
    addNodeListStyle([aliyunDocsSynopsis], 'height', `calc(100vh - ${top + headHeight}px )`);
    addStyle(aliyunDocsMenuSearch, 'top', `${menuSearchOffset + top}px`);
  }
  // 右侧目录高亮标题始终在可视区域
  const currentSynopsisDOM = document.getElementsByClassName('current-synopsis')[0];
  const scrollDown = currentSynopsisDOM?.getBoundingClientRect()?.top + 32 - document.documentElement.clientHeight;
  const scrollUp = currentSynopsisDOM?.getBoundingClientRect()?.top - 54;
  if (scrollDown >= -10) {
    aliyunDocsSynopsis?.scrollBy({ left: 0, top: scrollDown + 10 });
  } else if (scrollUp < 0) {
    aliyunDocsSynopsis?.scrollBy({ left: 0, top: scrollUp });
  }
}

// 当前 js方法 为页面总结AI演示界面- ”什么是对象存储OSS“ 添加滚动监听
(function(){
  window.addEventListener('scroll', followScroll);
})()