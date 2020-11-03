<template>
  <div class="webgl-component" ref="container"></div>
</template>

<script lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
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

    let camera, scene, renderer, geometry, material
    let group
    let settings, gui
    let composer

    const setSize = () => {
      const { width, height } = container.value.getBoundingClientRect()

      renderer.setSize(width, height)
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
      const time = clock.elapsedTime
      const delta = clock.getDelta()
      const velocity = settings.speed * delta + (settings.acc * time) / 1000.0

      settings.velocity = velocity

      group.children.forEach(c => {
        c.position.x = calcPos(
          c.position.x - velocity,
          (4 + (margin * meshes.length) / 2) * -1,
          (4 + (margin * meshes.length) / 2) * 1
        )
        c.material.uniforms.uPos.value = c.position.x
        c.material.uniforms.time.value = time
      })

      camera.position.z = settings.cameraZ

      composer.render(scene, camera)
      gui.updateDisplay()
    }

    const initGUI = () => {
      settings = {
        speed: 0.5,
        acc: 0.0,
        velocity: 0.0,
        cameraZ: 3.0,
      }

      gui = new dat.GUI({ name: 'My GUI' })
      gui.add(settings, 'speed', -5.0, 5.0, 0.1)
      gui.add(settings, 'acc', 0.0, 5.0, 0.01)
      gui.add(settings, 'velocity', 0, 1000.0, 0.001)
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
        fragmentShader: require('./fragment.glsl').default,
        vertexShader: require('./vertex.glsl').default,
        uniforms: {
          rgb: { value: [1, 1, 1] },
          time: { value: 0 },
          uPos: { value: 0.0 },
        },
        transparent: true,
      })

      group = new THREE.Group()

      for (let i = 0; i < 8; i++) {
        const m = new THREE.Mesh(geometry, material.clone())

        m.position.x = (1.0 + margin) * i
        m.material.uniforms.rgb.value = [
          Math.random(),
          Math.random(),
          Math.random(),
        ]

        meshes.push(m)
        group.add(m)
      }

      scene.add(group)

      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
      // new OrbitControls(camera, renderer.domElement)

      composer = new EffectComposer(renderer)

      const renderPass = new RenderPass(scene, camera)
      const shaderPass = new ShaderPass(CopyShader)
      // const shaderPass = new ShaderPass({
      //   fragmentShader: require('./pass.frag').default,
      //   vertexShader: require('./pass.vert').default,
      //   uniforms: {
      //     tDiffuse: { value: null },
      //   },
      // })

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

    onMounted(() => {
      init()

      window.addEventListener('resize', viewportHandler)
    })

    onUnmounted(() => {
      gui.destroy()
      window.removeEventListener('resize', viewportHandler)
    })

    return {
      container,
    }
  },
}
</script>
