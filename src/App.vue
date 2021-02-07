<template>
    <canvas-box ref="canvasBox" />

    <section class="hero is-info is-fullheight">
        <div class="hero-head">
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand">
                    </div>

                    <div id="navbarMenuHeroB" class="navbar-menu">
                        <div class="navbar-end">
<!--                            <a class="navbar-item">-->
<!--                                Home-->
<!--                            </a>-->
<!--                            <a class="navbar-item">-->
<!--                                Examples-->
<!--                            </a>-->
<!--                            <a class="navbar-item">-->
<!--                                Documentation-->
<!--                            </a>-->
                        </div>
                    </div>
                </div>
            </nav>
        </div>

        <!--        <div class="hero-body">-->
        <!--            <div class="container has-text-centered">-->
        <!--                content here-->
        <!--            </div>-->
        <!--        </div>-->
    </section>
</template>

<script>
import CanvasBox from "./components/CanvasBox.vue";

export default {
    name: 'App',
    components: {
        CanvasBox,
    },
    mounted() {
    },
}
</script>
