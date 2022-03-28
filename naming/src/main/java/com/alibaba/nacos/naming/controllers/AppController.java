/*
 * Copyright 1999-2018 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.alibaba.nacos.naming.controllers;

import com.alibaba.nacos.api.exception.NacosException;
import com.alibaba.nacos.api.utils.StringUtils;
import com.alibaba.nacos.common.utils.Objects;
import com.alibaba.nacos.naming.core.ServiceManager;
import com.alibaba.nacos.naming.misc.UtilsAndCommons;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * @author sea
 * @date 2021/9/29
 */
@RestController
@RequestMapping(UtilsAndCommons.NACOS_NAMING_CONTEXT + "/app")
public class AppController {

    @Autowired
    protected ServiceManager serviceManager;

    @GetMapping("/info")
    public Object dubboApplicationList(@RequestParam(value = "namespaceId", defaultValue = "public") String namespaceId, String application) {
        return serviceManager.getDubboAppInfo(namespaceId, application);
    }

    @GetMapping("/services")
    public Object getDubboServices(@RequestParam(value = "namespaceId", defaultValue = "public") String namespaceId, String application, String ip) {
        return serviceManager.getDubboServices(namespaceId, application, ip);
    }

    @GetMapping("/detail")
    public Object dubboApplicationDetail(@RequestParam(value = "namespaceId", defaultValue = "public") String namespaceId, String application) {
        return serviceManager.getDubboAppInfoDetail(namespaceId, application);
    }

    @PostMapping("/application")
    public Object updateApplication(@RequestParam("namespaceId") String namespaceId, @RequestParam("name") String application, @RequestParam("ip") String ip, @RequestParam("enabled") Boolean enabled) throws NacosException {
        if (StringUtils.isBlank(application) || StringUtils.isBlank(namespaceId) || StringUtils.isBlank(ip) || Objects.isNull(enabled)) {
            throw new NacosException(NacosException.CLIENT_INVALID_PARAM, "请求参数错误");
        }
        serviceManager.updateApplication(namespaceId, application, ip, enabled);
        return "ok";
    }
}
