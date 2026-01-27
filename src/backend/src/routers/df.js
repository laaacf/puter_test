/*
 * Copyright (C) 2024-present Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
'use strict';
const express = require('express');
const config = require('../config.js');
const router = new express.Router();
const auth = require('../middleware/auth.js');

// TODO: Why is this both a POST and a GET?

// -----------------------------------------------------------------------//
// POST /df
// -----------------------------------------------------------------------//
router.post('/df', auth, express.json(), async (req, response, next) => {
    // check subdomain
    if ( require('../helpers').subdomain(req) !== 'api' )
    {
        next();
    }

    // check if user is verified
    if ( (config.strict_email_verification_required || req.user.requires_email_confirmation) && !req.user.email_confirmed )
    {
        return response.status(400).send({ code: 'account_is_not_verified', message: 'Account is not verified' });
    }

    const { df } = require('../helpers');
    const svc_hostDiskUsage = req.services.get('host-disk-usage', { optional: true });
    try {
        // 自托管部署的存储显示逻辑：
        // - used: Puter 文件占用空间
        // - capacity: 系统空闲空间（磁盘剩余可用空间）
        // 这样用户能清楚看到磁盘还有多少空间可用
        response.send({
            used: parseInt(await df(req.user.id)),
            capacity: config.available_device_storage,
        });
    } catch (e) {
        console.log(e);
        response.status(400).send();
    }
});

// -----------------------------------------------------------------------//
// GET /df
// -----------------------------------------------------------------------//
router.get('/df', auth, express.json(), async (req, response, next) => {
    // check subdomain
    if ( require('../helpers').subdomain(req) !== 'api' )
    {
        next();
    }

    // check if user is verified
    if ( (config.strict_email_verification_required || req.user.requires_email_confirmation) && !req.user.email_confirmed )
    {
        return response.status(400).send({ code: 'account_is_not_verified', message: 'Account is not verified' });
    }

    const { df } = require('../helpers');
    const svc_hostDiskUsage = req.services.get('host-disk-usage', { optional: true });
    try {
        // 自托管部署的存储显示逻辑：
        // - used: Puter 文件占用空间
        // - capacity: 系统空闲空间（磁盘剩余可用空间）
        // 这样用户能清楚看到磁盘还有多少空间可用
        response.send({
            used: parseInt(await df(req.user.id)),
            capacity: config.available_device_storage,
        });
    } catch (e) {
        console.log(e);
        response.status(400).send();
    }
});

module.exports = router;