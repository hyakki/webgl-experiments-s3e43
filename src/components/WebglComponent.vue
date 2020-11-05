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
import Hammer from 'hammerjs'
import dat from 'dat.gui'
import gsap from 'gsap'

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
    let hammer
    let demoStarted = false

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
      clock.getElapsedTime()

      if (!demoStarted) {
        velocity.add(acc)
        acc.x = -velocity.x / 15.0
      }

      group.children.forEach(c => {
        c.position.x = calcPos(c.position.x - velocity.x, -range, range)
        c.material.uniforms.uPos.value = c.position.x
      })

      camera.position.z = settings.cameraZ

      shaderPass.uniforms.uShift.value = velocity.length() / 10.0

      composer.render(scene, camera)
      gui.updateDisplay()
    }

    const playDemo = (activate = false) => {
      if (!activate) {
        return
      }

      demoStarted = true

      gsap.to(velocity, {
        x: 0.02,
        duration: 1.0,
      })
    }

    const initGUI = () => {
      settings = {
        cameraZ: 2.0,
      }

      gui = new dat.GUI({ name: 'My GUI', closed: true })
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

      playDemo(false)
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

      if (!demoStarted) {
        hammer = new Hammer.Manager(container.value)
        hammer.add(
          new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 })
        )

        hammer.on('pan', e => {
          velocity.x += e.deltaX / 10000.0
        })

        window.addEventListener('mousewheel', mouseWheelHandler)
      }
    })

    onUnmounted(() => {
      gui.destroy()
      hammer.destroy()

      window.removeEventListener('resize', viewportHandler)
      window.removeEventListener('mousewheel', mouseWheelHandler)
    })

    return {
      container,
    }
  },
}
</script>
