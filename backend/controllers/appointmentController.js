import { parse, formatISO, startOfDay, endOfDay, isValid } from "date-fns";
import Appointmet from '../models/Appointment.js'
import { validateObjectId, handleNotFoundError, formatDate } from "../utils/index.js";
import { sendEmailNewAppointment, sendEmailUpdateAppointment, sendEmailDeleteAppointment } from "../emails/appointmentEmailService.js";

const createAppointment = async (req, res) => {
    const appointment = req.body
    appointment.user = req.user._id.toString()

    try {
        const newAppointment = new Appointmet(appointment)
        const result = await newAppointment.save()

        await sendEmailNewAppointment({
            date: formatDate(result.date),
            time: result.time
        })

        res.json({
            msg: 'Tu Reserva se Realizó Correctamente'
        })
    } catch (error) {
        console.log(error)
    }
}

const getAppointmentByDate = async (req, res) => {
    const { date } = req.query

    const newDate = parse(date, 'dd/MM/yyyy', new Date())

    if(!isValid(newDate)) {
        const error = new Error('Fecha no válida')
        return res.status(400).json({msg: error.message})
    }

    const isoDate = formatISO(newDate)

    const appointments = await Appointmet.find({date: {
        $gte: startOfDay(new Date(isoDate)),
        $lte: endOfDay(new Date(isoDate))
    }}).select('time')

    res.json(appointments)
}

const getAppointmentById = async(req, res) => {
    const { id } = req.params

    // Validar por object id
    if(validateObjectId(id, res)) return

    // Validar que exista
    const appointment = await Appointmet.findById(id).populate('services')
    if(!appointment) {
        return handleNotFoundError('La cita no existe', res)
    }

    // Validar que la persona que reservo la cita sea la única que pueda modificarla
    if(appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('No tienes los permisos')
        return res.status(403).json({msg: error.message})
    }

    // Devolver la cita
    res.json(appointment)
}

const updateAppointment = async (req, res) => {
    const { id } = req.params

    // Validar por object id
    if(validateObjectId(id, res)) return

    // Validar que exista
    const appointment = await Appointmet.findById(id).populate('services')
    if(!appointment) {
        return handleNotFoundError('La cita no existe', res)
    }

    // Validar que la persona que reservo la cita sea la única que pueda modificarla
    if(appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('No tienes los permisos')
        return res.status(403).json({msg: error.message})
    }

    const { date, time, totalAmount, services } = req.body
    appointment.date = date
    appointment.time = time
    appointment.totalAmount = totalAmount
    appointment.services = services

    try {
        const result = await appointment.save()

        console.log(result)
        await sendEmailUpdateAppointment({
            date: formatDate(result.date),
            time: result.time
        })
        res.json({
            msg: 'Cita Actualizada Correctamente'
        })
    } catch (error) {
        console.log(error)
    }
}

const deleteAppointment = async (req, res) => {
    const { id } = req.params

    // Validar por object id
    if(validateObjectId(id, res)) return

    // Validar que exista
    const appointment = await Appointmet.findById(id).populate('services')
    if(!appointment) {
        return handleNotFoundError('La cita no existe', res)
    }

    // Validar que la persona que reservo la cita sea la única que pueda modificarla
    if(appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('No tienes los permisos')
        return res.status(403).json({msg: error.message})
    }

    try {
        const result = await appointment.deleteOne()

        /**
         * result no devuelve la cita borrada
         * devuelve el estado de la operación realizada
         * { acknowledged: true, deletedCount: 1 }
         */
        
        // console.log(result)
        
        // await sendEmailDeleteAppointment({
        //     date: formatDate(result.date),
        //     time: result.time
        // })

        res.json({msg: 'Cita Cancelada Exitosamente'})
    } catch (error) {
        console.log(error)
    }
}

export{
    createAppointment,
    getAppointmentByDate,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
}