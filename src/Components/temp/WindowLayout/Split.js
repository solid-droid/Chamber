// The programming goals of Split.js are to deliver readable, understandable and
// maintainable code, while at the same time manually optimizing for tiny minified file size,
// browser compatibility without additional requirements
// and very few assumptions about the user's page layout.
const global = typeof window !== 'undefined' ? window : null
const ssr = global === null
const document = !ssr ? global.document : undefined

const addEventListener = 'addEventListener'
const removeEventListener = 'removeEventListener'
const getBoundingClientRect = 'getBoundingClientRect'
const gutterStartDragging = '_a'
const aGutterSize = '_b'
const bGutterSize = '_c'
const HORIZONTAL = 'horizontal'
const NOOP = () => false

const calc = ssr
    ? 'calc'
    : `${['', '-webkit-', '-moz-', '-o-']
          .filter(prefix => {
              const el = document.createElement('div')
              el.style.cssText = `width:${prefix}calc(9px)`
              return !!el.style.length
          })
          .shift()}calc`

const isString = v => typeof v === 'string' || v instanceof String

const elementOrSelector = el => {
    if (isString(el)) {
        const ele = document.querySelector(el)
        if (!ele) {
            throw new Error(`Selector ${el} did not match a DOM element`)
        }
        return ele
    }
    return el
}

const getOption = (options, propName, def) => {
    const value = options[propName]
    if (value !== undefined) {
        return value
    }
    return def
}

const getGutterSize = (gutterSize, isFirst, isLast, gutterAlign) => {
    if (isFirst) {
        if (gutterAlign === 'end') return 0
        if (gutterAlign === 'center') return gutterSize / 2
    } else if (isLast) {
        if (gutterAlign === 'start') return 0
        if (gutterAlign === 'center') return gutterSize / 2
    }
    return gutterSize
}

const defaultGutterFn = (i, gutterDirection) => {
    const gut = document.createElement('div')
    gut.className = `gutter gutter-${gutterDirection}`
    return gut
}

const defaultElementStyleFn = (dim, size, gutSize) => {
    const style = {}
    style[dim] = isString(size) ? size : `${calc}(${size}% - ${gutSize}px)`
    return style
}

const defaultGutterStyleFn = (dim, gutSize) => ({ [dim]: `${gutSize}px` })

const Split = (idsOption, options = {}) => {
    if (ssr) return {}

    let ids = idsOption
    let dimension, clientAxis, position, positionEnd, clientSize
    let elements, pairs = []
    let onResizeCallback = null
    let lastValidSizes = null

    if (Array.from) ids = Array.from(ids)

    const firstElement = elementOrSelector(ids[0])
    const parent = firstElement.parentNode
    const parentStyle = getComputedStyle ? getComputedStyle(parent) : null
    const parentFlexDirection = parentStyle ? parentStyle.flexDirection : null

    let sizes = getOption(options, 'sizes') || ids.map(() => 100 / ids.length)
    const minSize = getOption(options, 'minSize', 100)
    const minSizes = Array.isArray(minSize) ? minSize : ids.map(() => minSize)
    const maxSize = getOption(options, 'maxSize', Infinity)
    const maxSizes = Array.isArray(maxSize) ? maxSize : ids.map(() => maxSize)

    const expandToMin = getOption(options, 'expandToMin', false)
    const gutterSize = getOption(options, 'gutterSize', 10)
    const gutterAlign = getOption(options, 'gutterAlign', 'center')
    const snapOffset = getOption(options, 'snapOffset', 30)
    const snapOffsets = Array.isArray(snapOffset) ? snapOffset : ids.map(() => snapOffset)
    const dragInterval = getOption(options, 'dragInterval', 1)
    const direction = getOption(options, 'direction', HORIZONTAL)
    const cursor = getOption(options, 'cursor', direction === HORIZONTAL ? 'col-resize' : 'row-resize')
    const gutter = getOption(options, 'gutter', defaultGutterFn)
    const elementStyle = getOption(options, 'elementStyle', defaultElementStyleFn)
    const gutterStyle = getOption(options, 'gutterStyle', defaultGutterStyleFn)

    if (direction === HORIZONTAL) {
        dimension = 'width'
        clientAxis = 'clientX'
        position = 'left'
        positionEnd = 'right'
        clientSize = 'clientWidth'
    } else {
        dimension = 'height'
        clientAxis = 'clientY'
        position = 'top'
        positionEnd = 'bottom'
        clientSize = 'clientHeight'
    }

    function setElementSize(el, size, gutSize, i) {
        const style = elementStyle(dimension, size, gutSize, i)
        Object.keys(style).forEach(prop => {
            el.style[prop] = style[prop]
        })
    }

    function setGutterSize(gutterElement, gutSize, i) {
        const style = gutterStyle(dimension, gutSize, i)
        Object.keys(style).forEach(prop => {
            gutterElement.style[prop] = style[prop]
        })
    }

    function getSizes() {
        return elements.map(element => element.size)
    }

    function applySizes(sizesArray) {
        sizesArray.forEach((newSize, i) => {
            if (i > 0) {
                const pair = pairs[i - 1]
                const a = elements[pair.a]
                const b = elements[pair.b]

                a.size = sizesArray[i - 1]
                b.size = newSize

                setElementSize(a.element, a.size, pair[aGutterSize], a.i)
                setElementSize(b.element, b.size, pair[bGutterSize], b.i)
            }
        })
    }

    function adjust(offset) {
        const a = elements[this.a]
        const b = elements[this.b]
        const percentage = a.size + b.size

        a.size = (offset / this.size) * percentage
        b.size = percentage - (offset / this.size) * percentage

        const newSizes = getSizes()

        if (onResizeCallback) {
            let cancelRequested = false
            onResizeCallback({
                sizes: newSizes,
                cancel: () => cancelRequested = true
            })
            if (cancelRequested) {
                if (lastValidSizes) {
                    applySizes(lastValidSizes)
                }
                return
            }
        }

        lastValidSizes = [...newSizes]

        setElementSize(a.element, a.size, this[aGutterSize], a.i)
        setElementSize(b.element, b.size, this[bGutterSize], b.i)
    }

    function getMousePosition(e) {
        if ('touches' in e) return e.touches[0][clientAxis]
        return e[clientAxis]
    }

    function drag(e) {
        if (!this.dragging) return

        let offset = getMousePosition(e) - this.start + (this[aGutterSize] - this.dragOffset)

        if (dragInterval > 1) {
            offset = Math.round(offset / dragInterval) * dragInterval
        }

        const a = elements[this.a]
        const b = elements[this.b]

        if (offset <= a.minSize + a.snapOffset + this[aGutterSize]) {
            offset = a.minSize + this[aGutterSize]
        } else if (offset >= this.size - (b.minSize + b.snapOffset + this[bGutterSize])) {
            offset = this.size - (b.minSize + this[bGutterSize])
        }

        if (offset >= a.maxSize - a.snapOffset + this[aGutterSize]) {
            offset = a.maxSize + this[aGutterSize]
        } else if (offset <= this.size - (b.maxSize - b.snapOffset + this[bGutterSize])) {
            offset = this.size - (b.maxSize + this[bGutterSize])
        }

        adjust.call(this, offset)
        getOption(options, 'onDrag', NOOP)(getSizes())
    }

    function startDragging(e) {
        if ('button' in e && e.button !== 0) return

        e.preventDefault()
        this.dragging = true

        this.move = drag.bind(this)
        this.stop = stopDragging.bind(this)

        global[addEventListener]('mouseup', this.stop)
        global[addEventListener]('touchend', this.stop)
        global[addEventListener]('mousemove', this.move)
        global[addEventListener]('touchmove', this.move)

        const a = elements[this.a].element
        const b = elements[this.b].element

        a[addEventListener]('selectstart', NOOP)
        b[addEventListener]('selectstart', NOOP)

        a.style.userSelect = 'none'
        b.style.userSelect = 'none'

        this.gutter.style.cursor = cursor
        this.parent.style.cursor = cursor
        document.body.style.cursor = cursor

        const aBounds = a[getBoundingClientRect]()
        const bBounds = b[getBoundingClientRect]()

        this.size = aBounds[dimension] + bBounds[dimension] + this[aGutterSize] + this[bGutterSize]
        this.start = aBounds[position]
        this.end = aBounds[positionEnd]
        this.dragOffset = getMousePosition(e) - this.end
    }

    function stopDragging() {
        if (!this.dragging) return

        this.dragging = false
        global[removeEventListener]('mouseup', this.stop)
        global[removeEventListener]('touchend', this.stop)
        global[removeEventListener]('mousemove', this.move)
        global[removeEventListener]('touchmove', this.move)

        const a = elements[this.a].element
        const b = elements[this.b].element

        a.style.userSelect = ''
        b.style.userSelect = ''

        this.gutter.style.cursor = ''
        this.parent.style.cursor = ''
        document.body.style.cursor = ''
    }

    elements = ids.map((id, i) => {
        const element = {
            element: elementOrSelector(id),
            size: sizes[i],
            minSize: minSizes[i],
            maxSize: maxSizes[i],
            snapOffset: snapOffsets[i],
            i,
        }

        if (i > 0) {
            const pair = {
                a: i - 1,
                b: i,
                dragging: false,
                direction,
                parent,
            }

            pair[aGutterSize] = getGutterSize(gutterSize, i - 1 === 0, false, gutterAlign)
            pair[bGutterSize] = getGutterSize(gutterSize, false, i === ids.length - 1, gutterAlign)

            if (parentFlexDirection === 'row-reverse' || parentFlexDirection === 'column-reverse') {
                const temp = pair.a
                pair.a = pair.b
                pair.b = temp
            }

            const gutterElement = gutter(i, direction, element.element)
            setGutterSize(gutterElement, gutterSize, i)

            pair[gutterStartDragging] = startDragging.bind(pair)
            gutterElement[addEventListener]('mousedown', pair[gutterStartDragging])
            gutterElement[addEventListener]('touchstart', pair[gutterStartDragging])
            parent.insertBefore(gutterElement, element.element)

            pair.gutter = gutterElement
            pairs.push(pair)
        }

        setElementSize(
            element.element,
            element.size,
            getGutterSize(gutterSize, i === 0, i === ids.length - 1, gutterAlign),
            i,
        )

        return element
    })

    function adjustToMin(element) {
        const isLast = element.i === pairs.length
        const pair = isLast ? pairs[element.i - 1] : pairs[element.i]
        const size = isLast ? pair.size - element.minSize - pair[bGutterSize] : element.minSize + pair[aGutterSize]
        adjust.call(pair, size)
    }

    function destroy(preserveStyles, preserveGutter) {
        pairs.forEach(pair => {
            if (!preserveGutter) {
                pair.parent.removeChild(pair.gutter)
            } else {
                pair.gutter[removeEventListener]('mousedown', pair[gutterStartDragging])
                pair.gutter[removeEventListener]('touchstart', pair[gutterStartDragging])
            }

            if (!preserveStyles) {
                const a = elements[pair.a].element
                const b = elements[pair.b].element
                a.style[dimension] = ''
                b.style[dimension] = ''
            }
        })
    }

    return {
        setSizes: applySizes,
        getSizes,
        collapse(i) {
            adjustToMin(elements[i])
        },
        destroy,
        parent,
        pairs,
        onResize(cb) {
            onResizeCallback = typeof cb === 'function' ? cb : null
        },
    }
}

export default Split;
