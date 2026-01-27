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

const eggspress = require('../api/eggspress');
const path = require('path');

// -----------------------------------------------------------------------//
// GET /builtin/:name
// -----------------------------------------------------------------------//
const router = eggspress(['/builtin/:name'], {
    allowedMethods: ['GET'],
    middleware: [],
}, async (req, res) => {
    const name = req.params.name;

    // 安全检查：只允许已知的内置应用名称
    const allowedApps = ['viewer', 'editor', 'pdf', 'player', 'draw', 'code'];

    if ( ! allowedApps.includes(name) ) {
        return res.status(404).send('Builtin app not found');
    }

    // 提供静态文件
    const staticPath = path.join(__dirname, '../../builtin', name, 'index.html');

    res.sendFile(staticPath, (err) => {
        if ( err ) {
            res.status(404).send('Builtin app not found');
        }
    });
});

module.exports = router;
