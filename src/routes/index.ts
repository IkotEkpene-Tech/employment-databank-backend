import express from 'express';
import wardsAndVillageRouter from './wardAndVillages'
import applicantsRouter from './applicantRoutes';



const router = express.Router()

router.use('/wards-and-villages', wardsAndVillageRouter)
router.use('/applicants', applicantsRouter)






export default router;