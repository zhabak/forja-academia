package com.academia.gym.service;
import java.security.*;
import java.util.*;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
/** PBKDF2 com sal aleatório para senhas; tokens aleatórios persistidos somente como hash. */
public final class Credenciais {
    public static String token(){byte[] b=new byte[32];new SecureRandom().nextBytes(b);return Base64.getUrlEncoder().withoutPadding().encodeToString(b);}
    public static String hash(String s){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(java.nio.charset.StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
    public static String senha(String s){byte[] sal=new byte[16];new SecureRandom().nextBytes(sal);return Base64.getEncoder().encodeToString(sal)+":"+derivar(s,sal);}
    private static String derivar(String s,byte[] sal){try{var spec=new PBEKeySpec(s.toCharArray(),sal,600000,256);try{return Base64.getEncoder().encodeToString(SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded());}finally{spec.clearPassword();}}catch(Exception e){throw new IllegalStateException(e);}}
    public static boolean confere(String s,String h){if(h==null)return false;try{String[] p=h.split(":");return MessageDigest.isEqual(derivar(s,Base64.getDecoder().decode(p[0])).getBytes(),p[1].getBytes());}catch(Exception e){return false;}}
}
