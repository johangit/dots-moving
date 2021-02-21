<template>
    <canvas-box ref="canvasBox" :status="canvasBoxStatus" />

    <section class="hero is-info is-fullheight">
        <div class="hero-head">
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand">
                    </div>

                    <div id="navbarMenuHeroB" class="navbar-menu">
                        <div class="navbar-end">
                            <a class="navbar-item"
                               v-if="!canvasPlay"
                               v-on:click.prevent="canvasPlay = true">
                                Play
                            </a>
                            <a class="navbar-item"
                               v-if="canvasPlay"
                               v-on:click.prevent="canvasPlay = false">
                                Pause
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </section>
</template>

<script>
import CanvasBox from "./components/CanvasBox.vue";
import {STATUS_PAUSE, STATUS_PLAY} from "./assets/box";

export default {
    name: 'App',
    components: {
        CanvasBox,
    },
    data: () => ({
        canvasPlay: false,
    }),
    computed: {
        canvasBoxStatus() {
            return this.canvasPlay ? STATUS_PLAY : STATUS_PAUSE;
        }
    },
    mounted() {
    },
}
</script>
