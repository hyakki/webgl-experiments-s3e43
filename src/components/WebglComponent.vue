<template>
  <div class="webgl-component" ref="container"></div>
</template>

<script lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import t1 from './textures/t1.jpg'
import t2 from './textures/t2.jpg'
import t3 from './textures/t3.jpg'
import t4 from './textures/t4.jpg'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import dat from 'dat.gui'

// eslint-disable-next-line
// let OrbitControls = require('three-orbit-controls')(THREE)

export default {
  name: 'WebglComponent',
  setup() {
    const container = ref()
    const clock = new THREE.Clock()
    const meshes: THREE.Mesh[] = []
    const margin = 0.1

    const velocity = new THREE.Vector2(0.0, 0)
    const acc = new THREE.Vector2(0.0, 0)

    let camera, scene, renderer, geometry, material
    let group
    let settings, gui
    let composer, renderPass, shaderPass
    let range

    const textures = [
      new THREE.TextureLoader().load(t1),
      new THREE.TextureLoader().load(t2),
      new THREE.TextureLoader().load(t3),
      new THREE.TextureLoader().load(t4),
    ]

    const setSize = () => {
      const { width, height } = container.value.getBoundingClientRect()

      renderer.setPixelRatio(window.devicePixelRatio)

      renderer.setSize(width, height)
      composer.setSize(width, height)
    }

    const setCameraAspect = () => {
      const { width, height } = container.value.getBoundingClientRect()

      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const calcPos = (pos, start, end) => {
      const len = end - start
      let p = pos

      if (p < start) {
        p = p + len
      } else if (pos > end) {
        p = start + (pos % end)
      }

      return p
    }

    const update = () => {
      const time = clock.getElapsedTime()
      // const delta = clock.getDelta()
      // velocity = settings.speed
      velocity.add(acc)

      // const decc = velocity.clone().multiplyScalar(-0.1)

      // acc.sub(velocity.divideScalar(0.1))
      acc.x = -velocity.x / 15.0
      // acc = velocity.clone().multiplyScalar(-1)
      // acc.multiplyScalar(-0.01)
      // acc.set(-velocity.x / 10.0, -velocity.y / 10.0)
      // acc.sub(decc)

      // acc.x = THREE.MathUtils.lerp(acc.x, 0, 0.05)
      // velocity.x = THREE.MathUtils.lerp(velocity.x, 0, 0.3)

      group.children.forEach(c => {
        c.position.x = calcPos(c.position.x - velocity.x, -range, range)
        c.material.uniforms.uPos.value = c.position.x
        c.material.uniforms.time.value = time
      })

      camera.position.z = settings.cameraZ

      shaderPass.uniforms.uShift.value = velocity.length()

      composer.render(scene, camera)
      gui.updateDisplay()
    }

    const initGUI = () => {
      settings = {
        acc: 0.0,
        velocity: 0.0,
        cameraZ: 3.0,
        uShift: 0.0,
      }

      gui = new dat.GUI({ name: 'My GUI' })
      gui.add(settings, 'acc', 0.0, 5.0, 0.01)
      gui.add(settings, 'velocity', 0, 1000.0, 0.01)
      gui.add(settings, 'uShift', 0, 1.0, 0.01)
      gui.add(settings, 'cameraZ', 0, 10.0, 0.1)
    }

    const init = () => {
      initGUI()

      const { width, height } = container.value.getBoundingClientRect()

      camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
      camera.position.z = settings.cameraZ

      scene = new THREE.Scene()

      geometry = new THREE.PlaneBufferGeometry(1.0, 1.77, 1.0)
      material = new THREE.ShaderMaterial({
        vertexShader: require('./glsl/card.vert').default,
        fragmentShader: require('./glsl/card.frag').default,
        uniforms: {
          time: { value: 0 },
          uPos: { value: 0.0 },
          uTexture: { value: null },
        },
        transparent: true,
      })

      group = new THREE.Group()

      for (let i = 0; i < 8; i++) {
        const m = new THREE.Mesh(geometry, material.clone())

        m.position.x = (1.0 + margin) * i
        m.material.uniforms.uTexture.value = textures[i % textures.length]

        meshes.push(m)
        group.add(m)
      }

      range = 4 + (margin * meshes.length) / 2

      scene.add(group)

      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
      // new OrbitControls(camera, renderer.domElement)

      composer = new EffectComposer(renderer)

      renderPass = new RenderPass(scene, camera)
      shaderPass = new ShaderPass({
        fragmentShader: require('./glsl/pass.frag').default,
        vertexShader: require('./glsl/pass.vert').default,
        uniforms: {
          tDiffuse: { value: null },
          uShift: { value: 1.0 },
        },
      })

      composer.addPass(renderPass)
      composer.addPass(shaderPass)

      shaderPass.renderToScreen = true

      setSize()
      container.value.appendChild(renderer.domElement)

      clock.start()
      renderer.setAnimationLoop(update)
    }

    const viewportHandler = () => {
      setSize()
      setCameraAspect()
    }

    const mouseWheelHandler = e => {
      const { deltaY } = e

      velocity.x += deltaY > 0 ? 0.05 : -0.05
    }

    onMounted(() => {
      init()

      window.addEventListener('resize', viewportHandler)
      window.addEventListener('mousewheel', mouseWheelHandler)
    })

    onUnmounted(() => {
      gui.destroy()
      window.removeEventListener('resize', viewportHandler)
      window.removeEventListener('mousewheel', mouseWheelHandler)
    })

    return {
      container,
    }
  },
}
</script>
