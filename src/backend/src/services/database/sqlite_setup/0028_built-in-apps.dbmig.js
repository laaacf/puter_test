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

const insert = async (tbl, subject) => {
    const keys = Object.keys(subject);

    await write(`INSERT INTO \`${ tbl }\` ` +
        `(${ keys.map(key => key).join(', ') }) ` +
        `VALUES (${ keys.map(() => '?').join(', ') })`,
    keys.map(key => subject[key]));
};

const timestamp = '2024-01-01 00:00:00';

// Viewer - 图片查看器
await insert('apps', {
    uid: 'app-viewer-001',
    owner_user_id: 1,
    name: 'viewer',
    title: 'Viewer',
    description: 'Image viewer for Puter',
    index_url: 'https://builtins.namespaces.puter.com/viewer',
    icon: null,
    approved_for_listing: 1,
    approved_for_opening_items: 1,
    approved_for_incentive_program: 0,
    timestamp: timestamp,
});

// Editor - 文本编辑器
await insert('apps', {
    uid: 'app-editor-001',
    owner_user_id: 1,
    name: 'editor',
    title: 'Editor',
    description: 'Text editor for Puter',
    index_url: 'https://builtins.namespaces.puter.com/editor',
    icon: null,
    approved_for_listing: 1,
    approved_for_opening_items: 1,
    approved_for_incentive_program: 0,
    timestamp: timestamp,
});

// PDF - PDF查看器
await insert('apps', {
    uid: 'app-pdf-001',
    owner_user_id: 1,
    name: 'pdf',
    title: 'PDF Viewer',
    description: 'PDF viewer for Puter',
    index_url: 'https://builtins.namespaces.puter.com/pdf',
    icon: null,
    approved_for_listing: 1,
    approved_for_opening_items: 1,
    approved_for_incentive_program: 0,
    timestamp: timestamp,
});

// Player - 音视频播放器
await insert('apps', {
    uid: 'app-player-001',
    owner_user_id: 1,
    name: 'player',
    title: 'Player',
    description: 'Media player for Puter',
    index_url: 'https://builtins.namespaces.puter.com/player',
    icon: null,
    approved_for_listing: 1,
    approved_for_opening_items: 1,
    approved_for_incentive_program: 0,
    timestamp: timestamp,
});

// Draw - 绘图应用
await insert('apps', {
    uid: 'app-draw-001',
    owner_user_id: 1,
    name: 'draw',
    title: 'Draw',
    description: 'Drawing application for Puter',
    index_url: 'https://builtins.namespaces.puter.com/draw',
    icon: null,
    approved_for_listing: 1,
    approved_for_opening_items: 1,
    approved_for_incentive_program: 0,
    timestamp: timestamp,
});
