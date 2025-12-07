package com.s4p.entreprise.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    @Qualifier("userService")
    @Lazy
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        logger.debug("🔍 Traitement de: " + path);
        
        try {
            // Extraire le token JWT du header Authorization
            String jwt = getJwtFromRequest(request);
            logger.debug("🎫 JWT extrait: " + (jwt != null ? "présent (" + jwt.substring(0, Math.min(20, jwt.length())) + "...)" : "absent"));

            // Valider et traiter le token s'il existe
            if (StringUtils.hasText(jwt)) {
                logger.debug("🔐 Validation du token...");
                boolean isValid = jwtTokenProvider.validateToken(jwt);
                logger.debug("🔐 Token valide: " + isValid);
                
                if (isValid) {
                    String email = jwtTokenProvider.getUsernameFromToken(jwt);
                    logger.debug("📧 Email extrait du token: " + email);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    logger.debug("👤 UserDetails chargé: " + userDetails.getUsername());
                    logger.debug("🔐 Authorities: " + userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("✅ Authentication définie dans SecurityContext pour: " + email);
                } else {
                    logger.debug("❌ Token invalide");
                }
            } else {
                logger.debug("⚠️ Aucun token JWT trouvé dans le header Authorization");
            }
        } catch (Exception ex) {
            logger.error("❌ Erreur lors de l'authentification JWT", ex);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extraire le token JWT du header Authorization
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        logger.debug("📨 Header Authorization: " + (bearerToken != null ? bearerToken.substring(0, Math.min(30, bearerToken.length())) + "..." : "absent"));
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }

    /**
     * Ne pas appliquer ce filtre aux routes publiques
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        boolean shouldSkip = path.equals("/api/auth/login") || 
               path.equals("/api/health") ||
               path.startsWith("/api/auth/");
        
        if (shouldSkip) {
            logger.debug("⏭️ Filtre JWT ignoré pour: " + path);
        }
        
        return shouldSkip;
    }
}