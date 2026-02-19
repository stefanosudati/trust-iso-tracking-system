const router = require('express').Router();
const { requireAuth } = require('../../middleware/auth');

router.use(requireAuth);

router.use('/', require('./crud'));
router.use('/', require('./evaluations'));
router.use('/', require('./documents'));
router.use('/', require('./milestones'));
router.use('/', require('./changelog'));

module.exports = router;
