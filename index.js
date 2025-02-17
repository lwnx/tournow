// 复制功能相关函数
window.handleCopy = function(cardData) {
    console.log('准备复制数据:', cardData);
    const text = formatCardText(cardData, cardData.type || 'activity');
    console.log('格式化后的文本:', text);
    return window.copyText(text);
};

// 复制功能
window.copyText = function(text) {
    if (!text) {
        console.error('复制失败：文本为空');
        showToast('复制失败：无内容');
        return false;
    }
    
    console.log('准备复制文本:', text);
    
    // 尝试使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        console.log('使用 Clipboard API');
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Clipboard API 复制成功');
                showToast('复制成功！');
                return true;
            })
            .catch((err) => {
                console.error('Clipboard API 复制失败:', err);
                fallbackCopy(text);
            });
    } else {
        console.log('使用传统复制方法');
        return fallbackCopy(text);
    }
};

// 传统复制方法
function fallbackCopy(text) {
    // 创建临时文本框
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // 确保文本框在可见区域内但不影响布局
    textarea.style.cssText = 'position:fixed;top:50%;left:50%;opacity:0;z-index:-1;';
    
    document.body.appendChild(textarea);
    
    try {
        console.log('选择文本准备复制');
        textarea.focus();
        textarea.select();
        
        const success = document.execCommand('copy');
        if (success) {
            console.log('传统方法复制成功');
            showToast('复制成功！');
            return true;
        } else {
            console.error('execCommand 返回失败');
            showToast('复制失败，请手动复制');
            return false;
        }
    } catch (err) {
        console.error('传统复制方法失败:', err);
        showToast('复制失败，请手动复制');
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

// 格式化卡片数据
function formatCardText(data, type) {
    console.log('格式化数据:', type, data);
    
    const lines = [`【${data.title || ''}】`];
    
    // 根据类型添加特定信息
    switch (type) {
        case 'activity':
            if (data.date) {
                let dateStr = `时间：${data.date}`;
                if (data.enddate) dateStr += ` - ${data.enddate}`;
                if (data.times) dateStr += ` ${data.times}`;
                lines.push(dateStr);
            }
            break;
            
        case 'food':
            if (data.type) lines.push(`类型：${data.type}`);
            if (data.businessHours) lines.push(`营业时间：${data.businessHours}`);
            if (data.price) lines.push(`价格：${data.price}`);
            if (data.specialties) {
                const specialties = Array.isArray(data.specialties) 
                    ? data.specialties.join('、') 
                    : data.specialties;
                lines.push(`特色：${specialties}`);
            }
            break;
            
        case 'parking':
            if (data.type) lines.push(`类型：${data.type}`);
            if (data.capacity) lines.push(`车位数：${data.capacity} 个`);
            if (data.price) lines.push(`价格：${data.price}`);
            break;
    }
    
    // 添加地点信息
    let location = `地点：${data.location || ''}`;
    if (data.city) {
        location += ` (${data.city}`;
        if (data.district) location += data.district;
        location += ')';
    }
    lines.push(location);
    
    // 添加标签
    if (data.tags) {
        const tags = Array.isArray(data.tags) ? data.tags.join('、') : data.tags;
        if (tags) lines.push(`标签：${tags}`);
    }
    
    const text = lines.join('\n');
    console.log('格式化结果:', text);
    return text;
}

// 卡片创建函数
function createCard(data, type) {
    console.log('创建卡片:', type, data);
    
    const card = document.createElement('div');
    card.className = `card ${type}-card`;
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-duration', '500');
    card.style.willChange = 'transform';
    
    // 验证必要数据
    if (!data.title || !data.location) {
        console.error('卡片数据不完整:', data);
        return null;
    }

    // 创建标题
    const title = document.createElement('h2');
    title.textContent = data.title;
    card.appendChild(title);

    // 根据类型创建不同的卡片内容
    if (type === 'activity') {
        // 数据预处理
        const times = Array.isArray(data.times) ? data.times.join(', ') : (data.times || '');
        const team = Array.isArray(data.team) ? data.team.join(', ') : (data.team || '');
        const tags = Array.isArray(data.tags) ? data.tags : [];

        // 日期和时间
        const dateDetail = document.createElement('p');
        dateDetail.className = 'Detail';
        dateDetail.innerHTML = `<strong class="smalltit">日期:</strong> ${data.date}${data.enddate ? ' - ' + data.enddate : ''}<span class="time">${times}</span>`;
        card.appendChild(dateDetail);

        // 团队信息
        const teamDetail = document.createElement('p');
        teamDetail.className = 'Detail';
        teamDetail.innerHTML = `<strong>团队:</strong> ${team || '无'}`;
        card.appendChild(teamDetail);

        // 描述
        const descDetail = document.createElement('p');
        descDetail.className = 'Detail';
        descDetail.innerHTML = `<strong>描述:</strong> ${data.description || '无'}`;
        card.appendChild(descDetail);

        // 文化意义
        const cultureDetail = document.createElement('p');
        cultureDetail.className = 'Detail';
        cultureDetail.innerHTML = `<strong>文化意义:</strong> ${data.culturalMeaning || '无'}`;
        card.appendChild(cultureDetail);

        // 标签容器
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = tag;
            tagsContainer.appendChild(tagSpan);
        });
        card.appendChild(tagsContainer);

    } else if (type === 'food') {
        // 数据预处理
        const specialties = Array.isArray(data.specialties) ? data.specialties.join(', ') : (data.specialties || '');
        const tags = Array.isArray(data.tags) ? data.tags : [];

        // 类型
        const typeDetail = document.createElement('p');
        typeDetail.className = 'Detail';
        typeDetail.innerHTML = `<strong class="smalltit">类型:</strong> ${data.type || '无'}`;
        card.appendChild(typeDetail);

        // 营业时间
        const hoursDetail = document.createElement('p');
        hoursDetail.className = 'Detail';
        hoursDetail.innerHTML = `<strong>营业时间:</strong> ${data.businessHours || '无'}`;
        card.appendChild(hoursDetail);

        // 价格
        const priceDetail = document.createElement('p');
        priceDetail.className = 'Detail';
        priceDetail.innerHTML = `<strong>价格:</strong> ${data.price || '无'}`;
        card.appendChild(priceDetail);

        // 特色
        const specialtiesDetail = document.createElement('p');
        specialtiesDetail.className = 'Detail';
        specialtiesDetail.innerHTML = `<strong>特色:</strong> ${specialties || '无'}`;
        card.appendChild(specialtiesDetail);

        // 描述
        const descDetail = document.createElement('p');
        descDetail.className = 'Detail';
        descDetail.innerHTML = `<strong>描述:</strong> ${data.description || '无'}`;
        card.appendChild(descDetail);

        // 优势
        const advantagesDetail = document.createElement('p');
        advantagesDetail.className = 'Detail';
        advantagesDetail.innerHTML = `<strong>优势:</strong> ${data.advantages || '无'}`;
        card.appendChild(advantagesDetail);

        // 标签容器
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = tag;
            tagsContainer.appendChild(tagSpan);
        });
        card.appendChild(tagsContainer);

    } else if (type === 'parking') {
        // 数据预处理
        const tags = Array.isArray(data.tags) ? data.tags : [];

        // 类型
        const typeDetail = document.createElement('p');
        typeDetail.className = 'Detail';
        typeDetail.innerHTML = `<strong class="smalltit">类型:</strong> ${data.type || '无'}`;
        card.appendChild(typeDetail);

        // 车位数
        const capacityDetail = document.createElement('p');
        capacityDetail.className = 'Detail';
        capacityDetail.innerHTML = `<strong>车位数:</strong> ${data.capacity || 0} 个`;
        card.appendChild(capacityDetail);

        // 价格
        if (data.price) {
            const priceDetail = document.createElement('p');
            priceDetail.className = 'Detail';
            priceDetail.innerHTML = `<strong>价格:</strong> ${data.price}`;
            card.appendChild(priceDetail);
        }

        // 标签容器
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = tag;
            tagsContainer.appendChild(tagSpan);
        });
        card.appendChild(tagsContainer);
    }

    // 分隔线
    const split = document.createElement('div');
    split.className = 'split';
    card.appendChild(split);

    // 地图区域
    const gomap = document.createElement('div');
    gomap.className = 'gomap';
    
    // 地点信息
    const locationDetail = document.createElement('p');
    locationDetail.className = 'Detail';
    locationDetail.innerHTML = `<strong>地点:</strong> ${data.location}`;
    gomap.appendChild(locationDetail);

    // 添加城市和区域的隐藏字段（用于筛选）
    const citySpan = document.createElement('span');
    citySpan.className = 'city';
    citySpan.style.display = 'none';
    citySpan.textContent = data.city || '';
    gomap.appendChild(citySpan);

    const districtSpan = document.createElement('span');
    districtSpan.className = 'district';
    districtSpan.style.display = 'none';
    districtSpan.textContent = data.district || '';
    gomap.appendChild(districtSpan);

    // 按钮（统一使用复制功能）
    const copyBtn = createCopyButton(data, type);
    
    gomap.appendChild(copyBtn);

    card.appendChild(gomap);
    return card;
}

// 创建复制按钮
function createCopyButton(data, type) {
    console.log('创建复制按钮:', data, type);
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.innerHTML = '<span class="btn-icon">📋</span><span class="btn-text">复制</span>';
    
    // 同时支持点击和键盘事件
    const copyHandler = function(event) {
        // 如果是键盘事件，只响应回车和空格
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
            return;
        }
        
        event.preventDefault();
        event.stopPropagation();
        
        console.log('复制按钮被触发 - 事件类型:', event.type);
        console.log('按钮状态:', {
            className: btn.className,
            isConnected: btn.isConnected,
            offsetParent: btn.offsetParent
        });
        
        try {
            const text = formatCardText(data, type);
            console.log('格式化后的文本:', text);
            if (text) {
                window.copyText(text);
                // 添加视觉反馈
                btn.classList.add('copying');
                setTimeout(() => btn.classList.remove('copying'), 200);
            } else {
                console.error('格式化文本为空');
                showToast('复制失败：无法获取文本内容');
            }
        } catch (error) {
            console.error('复制过程出错:', error);
            showToast('复制失败，请重试');
        }
    };
    
    // 绑定点击和键盘事件
    btn.addEventListener('click', copyHandler);
    btn.addEventListener('keydown', copyHandler);
    
    return btn;
}

// 城市和区域的映射关系
const cityDistricts = {
    "汕头": ["潮阳区", "濠江区", "金平区", "龙湖区", "潮南区", "澄海区"],
    "佛山": ["顺德区", "南海区", "高明区", "禅城区", "三水区", "高新区"],
    "珠海": ["横琴区", "香洲区", "金湾区"],
    "深圳": ["南山区", "福田区", "罗湖区", "宝安区", "龙岗区"],
    "广州": ["白云区", "天河区", "越秀区", "海珠区", "荔湾区"]
};

// 更新区域选择器的选项
function updateDistrictOptions(cityValue) {
    console.log('更新区域选择器:', cityValue);
    const districtSelect = document.getElementById('district-filter');
    if (!districtSelect) return;

    // 清空现有选项
    districtSelect.innerHTML = '<option value="all">所有区域</option>';
    
    // 如果选择了具体城市，添加该城市的区域选项
    if (cityValue !== 'all' && cityDistricts[cityValue]) {
        cityDistricts[cityValue].forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
    } else {
        // 如果选择"所有城市"，禁用区域选择
        districtSelect.disabled = true;
    }
}

// 筛选功能
function filterItems(type) {
    console.log('执行筛选:', type);
    const tagFilter = document.getElementById('tag-filter')?.value || 'all';
    const cityFilter = document.getElementById('city-filter')?.value || 'all';
    const districtFilter = document.getElementById('district-filter')?.value || 'all';
    
    console.log('筛选条件:', { tagFilter, cityFilter, districtFilter });
    
    const container = document.getElementById(`${type}-container`);
    if (!container) return;

    const cards = container.getElementsByClassName(`${type}-card`);
    Array.from(cards).forEach(card => {
        const tags = card.querySelector('.tags-container')?.textContent || '';
        const city = card.querySelector('.city')?.textContent || '';
        const district = card.querySelector('.district')?.textContent || '';

        const matchesTag = tagFilter === 'all' || tags.includes(tagFilter);
        const matchesCity = cityFilter === 'all' || city.includes(cityFilter);
        const matchesDistrict = districtFilter === 'all' || district.includes(districtFilter);

        if (matchesTag && matchesCity && (cityFilter === 'all' || matchesDistrict)) {
            card.style.display = '';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
}

// 读取数据并生成卡片
async function loadData(type) {
    console.log('开始加载数据:', type);
    try {
        const response = await fetch(`data/${type}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('加载到的数据:', data);

        const container = document.getElementById(`${type}-container`);
        if (!container) {
            console.error('找不到容器元素:', `${type}-container`);
            return;
        }

        // 清空容器
        container.innerHTML = '';
        
        // 确保 content 是数组
        const content = Array.isArray(data.content) ? data.content : [];
        
        // 创建并添加卡片
        content.forEach((item, index) => {
            const card = createCard(item, type);
            if (card) {
                card.id = `${type}-card-${index}`;
                container.appendChild(card);
            }
        });

        // 初始筛选
        filterItems(type);
        
        console.log('数据加载完成');
    } catch (error) {
        console.error('加载数据出错:', error);
        const container = document.getElementById(`${type}-container`);
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>加载数据时出错</p>
                    <button onclick="loadData('${type}')">重试</button>
                </div>
            `;
        }
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化 AOS 动画
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // 获取当前页面类型
    const pathname = window.location.pathname;
    let pageType = 'activity'; // 默认为活动页面

    if (pathname.includes('food.html')) {
        pageType = 'food';
    } else if (pathname.includes('car.html')) {
        pageType = 'parking';
    }

    console.log('当前页面类型:', pageType);

    // 设置筛选器事件监听
    const cityFilter = document.getElementById('city-filter');
    const districtFilter = document.getElementById('district-filter');
    const tagFilter = document.getElementById('tag-filter');

    if (cityFilter) {
        cityFilter.addEventListener('change', (e) => {
            updateDistrictOptions(e.target.value);
            filterItems(pageType);
        });
    }

    if (districtFilter) {
        districtFilter.addEventListener('change', () => filterItems(pageType));
    }

    if (tagFilter) {
        tagFilter.addEventListener('change', () => filterItems(pageType));
    }

    // 加载数据
    loadData(pageType);

    let ticking = false;
    const cards = document.querySelectorAll('.card');
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // 优化可见性检查
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const isVisible = (
                        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                        rect.bottom >= 0
                    );
                    if (isVisible) {
                        card.style.willChange = 'transform';
                    } else {
                        card.style.willChange = 'auto';
                    }
                });
                ticking = false;
            });
            ticking = true;
        }
    });
});

// 导航函数
function navigateTo(location) {
    // 使用百度地图导航
    const url = `https://api.map.baidu.com/geocoder?address=${encodeURIComponent(location)}&output=html&src=webapp.baidu.openAPIdemo`;
    window.open(url, '_blank');
}

// Toast 提示功能
function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 强制重绘
    toast.offsetHeight;

    // 显示 toast
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // 设置定时器移除 toast
    setTimeout(() => {
        toast.classList.remove('show');
        // 等待过渡效果完成后移除元素
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}
