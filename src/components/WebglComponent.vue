<template>
  <div class="webgl-component" ref="container"></div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import * as THREE from 'three'

// eslint-disable-next-line
let OrbitControls = require('three-orbit-controls')(THREE)

export default {
  name: 'WebglComponent',
  setup() {
    const container = ref()
    let time = 0
    let camera, scene, renderer, geometry, material, mesh

    const setSize = () => {
      const { width, height } = container.value.getBoundingClientRect()

      renderer.setSize(width, height)
    }

    const setCameraAspect = () => {
      const { width, height } = container.value.getBoundingClientRect()

      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const init = () => {
      const { width, height } = container.value.getBoundingClientRect()

      camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
      camera.position.z = 1

      scene = new THREE.Scene()

      geometry = new THREE.PlaneBufferGeometry(1.0, 1.0, 1.0)
      // !DEV
      // material = new THREE.MeshNormalMaterial()
      material = new THREE.ShaderMaterial({
        fragmentShader: require('./fragment.glsl').default,
        vertexShader: require('./vertex.glsl').default,
        uniforms: {
          time: { value: 1.0 },
        },
        side: THREE.DoubleSide,
      })
      mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      new OrbitControls(camera, renderer.domElement)

      setSize()
      container.value.appendChild(renderer.domElement)
    }

    const update = () => {
      // mesh.rotation.x += 0.005
      // mesh.rotation.y += 0.01

      renderer.render(scene, camera)

      window.requestAnimationFrame(update)

      time += 1
      material.uniforms.time.value = time
    }

    const viewportHandler = () => {
      setSize()
      setCameraAspect()
    }

    onMounted(() => {
      init()
      update()

      window.addEventListener('resize', viewportHandler)
    })

    return {
      container,
    }
  },
}
</script>
