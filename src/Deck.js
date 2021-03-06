/**
 * @format
 * @flow
 */

import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH
const SWIPE_OUT_DURATION = 250

export default class Deck extends Component {
  constructor(props) {
    super(props)

    const position = new Animated.ValueXY()
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy })
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe(true)
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe(false)
        } else {
          this.resetPosition()
        }
      }
    })

    this.state = { panResponder, position, index: 0 }
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true)
    LayoutAnimation.spring()
  }

  forceSwipe(toRight) {
    const x = toRight ? SCREEN_WIDTH : -SCREEN_WIDTH
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => {
      this.swipeCompleted(toRight)
    })
  }

  swipeCompleted(toRight) {
    const item = this.props.data[this.state.index]
    this.setState({ index: this.state.index + 1 })
    this.state.position.setValue({ x: 0, y: 0 })
    toRight ? this.swipeRight() : this.swipeLeft()
  }

  swipeRight() {
    console.log('right')
  }

  swipeLeft() {
    console.log('left')
  }

  resetPosition() {
    Animated.spring(this.state.position, { toValue: { x: 0, y: 0 } }).start()
  }

  getCardStyle() {
    const { position } = this.state
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    })

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    }
  }

  renderCards() {
    if (this.state.index === this.props.data.length) {
      return this.props.renderNoMoreCards(this)
    }
    return this.props.data
      .map((item, i) => {
        if (i < this.state.index) {
          return null
        }
        if (i === this.state.index) {
          return (
            <Animated.View
              key={item.id}
              style={[this.getCardStyle(), sty.card]}
              {...this.state.panResponder.panHandlers}>
              {this.props.renderCard(item)}
            </Animated.View>
          )
        }

        return (
          <Animated.View
            key={item.id}
            style={[sty.card, { top: 10 * (i - this.state.index) }]}>
            {this.props.renderCard(item)}
          </Animated.View>
        )
      })
      .reverse()
  }

  render() {
    return <View>{this.renderCards()}</View>
  }
}

const sty = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
})
