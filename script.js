const dataUrl =
  'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json'

;(async function () {
  const $inputSearch = document.querySelector('.search')
  const $ul = document.querySelector('.suggestions')

  const resp = await fetch(dataUrl)
  const jsonData = await resp.json()

  // 筛选出页面中需要展示的字段
  const cities = jsonData.map((item) => ({
    cityAndState: item.city + ',' + item.state,
    population: item.population,
  }))

  function handleInputKeyUp(e) {
    // 重置 ul 列表数据为初始值
    $ul.innerHTML = `
      <li>根据输入筛选数据</li>
      <li>
        <span class="name">{{城市, 州}}</span>
        <span class="population">{{人口}}</span>
      </li>`

    // 忽略输入值中的所有空格
    const value = e.target.value.split(' ').join('')

    if (value) {
      const filteredCities = getSuggestions(cities, value)

      // 使用数组来拼接 html 字符串
      const liArr = []

      filteredCities.forEach((item) => {
        let hightlightedCityAndState = ''
        for (let i = 0; i < item.cityAndState.length; i++) {
          const currentChar = item.cityAndState[i]
          if (item.matchedIndexArr.includes(i)) {
            hightlightedCityAndState += `<span class="hl" >${currentChar}</span>`
          } else {
            hightlightedCityAndState += currentChar
          }
        }

        liArr.push(`
            <li>
              <span class="name">${hightlightedCityAndState}</span>
              <span class="population">${item.population}</span>
            </li>`)
      })

      const txtUlInnerHtml = liArr.join('')
      $ul.innerHTML = txtUlInnerHtml
    }
  }

  const debouncedHandleInputKeyUp = debounce(handleInputKeyUp)

  $inputSearch.addEventListener('keyup', debouncedHandleInputKeyUp)

  /**
   * 判断目标字符串中所有字符是否按排列顺序包含在源字符串中
   * @param {string} source 源字符串
   * @param {string} target 目标字符串
   * @param {boolean} ignoreCase 是否忽略大小写
   */
  function isSubSet(source, target, ignoreCase = true) {
    let i = 0
    const matchedIndexArr = []

    // 相等性比较函数
    const equalityCompareFn = ignoreCase
      ? function (a, b) {
          return a.toLowerCase() === b.toLowerCase()
        }
      : function (a, b) {
          return a === b
        }

    for (let j = 0; j < source.length; j++) {
      if (i >= target.length) {
        break
      }
      if (equalityCompareFn(source[j], target[i])) {
        matchedIndexArr.push(j)
        i++
      }
    }

    if (i < target.length) {
      return { isSubSet: false }
    } else {
      return { isSubSet: true, matchedIndexArr }
    }
  }

  /**
   * 获取匹配的建议列表
   * @param {string} cities 全部城市信息
   * @param {string} value 输入的值
   */
  function getSuggestions(cities, value) {
    const filteredCities = []
    for (const city of cities) {
      const ret = isSubSet(city.cityAndState, value)
      if (ret.isSubSet) {
        filteredCities.push({ ...city, matchedIndexArr: ret.matchedIndexArr })
      }
    }

    return filteredCities
  }

  /**
   * 防抖函数
   * @param {Function} func 需要防抖的函数
   * @param {number} delay 延迟，ms 值
   */
  function debounce(func, delay = 500) {
    let timer = null

    return function (...args) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        func.call(this, ...args)
      }, delay)
    }
  }
})()
