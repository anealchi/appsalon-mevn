<script setup>
    import { onMounted, inject, ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router'
    import AuthAPI from '@/api/AuthAPI';

    const toast = inject('toast')
    const route = useRoute()
    const router = useRouter()
    const {token} = route.params

    const validToken = ref(false)

    onMounted(async () => {
        try {
            const {data} = await AuthAPI.verifyPasswordResetToken(token)
            validToken.value = true
        } catch (error) {
            toast.open({
                message: error.response.data.msg,
                type: 'error'
            })
        }
    })

    const handleSubmit = async ({password}) => {
        try {
            const {data} = await AuthAPI.updatePassword(token, {password})
            toast.open({
                message: data.msg,
                type: 'success'
            })
            setTimeout(() => {
                router.push({name: 'login'})
            }, 3000)
        } catch (error) {
            toast.open({
                message: error.response.data.msg,
                type: 'error'
            })
        }
    }
</script>

<template>
    <div v-if="validToken">
        <h1 class="text-6xl font-extrabold text-white text-center mt-10">Nueva contraseña</h1>
        <p class="text-2xl text-white text-center my-5">Ingresa tu nueva contraseña</p>
        
        <FormKit
            id="newPasswordForm"
            type="form"
            :actions="false"
            incomplete-message="No se pudo enviar, revisa las notificaciones"
            @submit="handleSubmit"
        >
        <FormKit
                type="password"
                label="Password"
                name="password"
                placeholder="Tu Contraseña - Min 8 Caracteres"
                validation="required|length:8"
                :validation-messages="{
                    required: 'La Contraseña es Obligatoria',
                    length: 'La Contraseña debe contener al menos 8 caracteres'
                }"
            />

            <FormKit
                type="password"
                label="Repetir Password"
                name="password_confirm"
                placeholder="Repite la Contraseña"
                validation="required|confirm"
                :validation-messages="{
                    required: 'Repetir Contraseña es Obligatoria',
                    confirm: 'Las contraseñas no son iguales'
                }"
            />

            <FormKit type="submit">Cambiar Contraseña</FormKit>
        </FormKit>
    </div>
    <p v-else class="text-center text-2xl font-black text-white">Token no válido</p>
</template>